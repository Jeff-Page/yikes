#!/usr/bin/env node

import ollama from 'ollama';
import readline from 'readline';

const CONTEXT_SIZE = 16384;
const MODEL = 'dolphin3:8b';

// Game configuration
const GENRES = {
  'fantasy': {
    starting_location: {
      name: 'Ruined Wizard\'s Tower',
      description: 'An ancient stone structure with crumbling upper levels.',
      features: ['weathered wooden door', 'ivy-covered walls']
    }
  },
  'scifi': {
    starting_location: {
      name: 'Orbital Station Spaceport',
      description: 'A bustling terminal filled with travelers from across the galaxy.',
      features: ['security checkpoints', 'large viewing windows']
    }
  }
};

// Initialize game state
class GameState {
  constructor(genre = 'fantasy') {
    this.world = {
      current_location: GENRES[genre].starting_location,
      known_locations: [GENRES[genre].starting_location.name],
      active_quests: []
    };
    
    this.character = {
      stats: {
        health: 100,
        inventory: []
      },
      history: []
    };

    this.transcript = '';
  }

  updateState(newState) {
    if (newState.health_change) {
      this.character.stats.health += newState.health_change;
      if (this.character.stats.health <= 0) {
        return 'GAME_OVER';
      }
    }

    if (newState.discovered_features) {
      this.world.current_location.features = [
        ...new Set([
          ...this.world.current_location.features,
          ...newState.discovered_features
        ])
      ];
    }

    if (newState.knowledge_gained && newState.knowledge_gained.length > 0) {
      // Store each discovery as a separate entry with a single string detail
      newState.knowledge_gained.forEach(discovery => {
        this.character.history.push({
          type: 'discovery',
          details: discovery,
          timestamp: new Date().toISOString()
        });
      });
    }

    // Handle inventory changes
    if (newState.inventory_changes) {
      if (newState.inventory_changes.add) {
        this.character.stats.inventory = [
          ...new Set([
            ...this.character.stats.inventory,
            ...newState.inventory_changes.add
          ])
        ];
      }
      if (newState.inventory_changes.remove) {
        this.character.stats.inventory = this.character.stats.inventory.filter(
          item => !newState.inventory_changes.remove.includes(item)
        );
      }
    }

    return 'CONTINUE';
  }
}

// Build context for LLM
function buildContext(gameState, userInput) {
  return {
    system: {
      role: 'Game Master',
      rules: [
        'Respond in character as a narrative GM',
        'Maintain consistent world state',
        'Signal state changes through structured format'
      ]
    },
    world: gameState.world,
    character: gameState.character,
    transcript: gameState.transcript,
    player_input: userInput
  };
}

// Parse LLM response
function parseResponse(response) {
  try {
    // Extract structured data from json blocks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      throw new Error('Response missing structured data block');
    }
    
    const parsed = JSON.parse(jsonMatch[1]);
    if (!parsed.narrative || !parsed.effects) {
      throw new Error('Invalid response structure');
    }
    
    return parsed;
  } catch (error) {
    console.warn('Error parsing response:', error);
    return {
      narrative: 'Something went wrong. Please try again.',
      effects: {},
      available_actions: ['try again', 'look around', 'wait']
    };
  }
}

// Main game loop
async function runGame(genre) {
  console.log(`Starting new game in ${genre} setting...\n`);
  
  const gameState = new GameState(genre);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // System prompt to guide LLM responses
  const systemPrompt = `You are a TTRPG Game Master. For every player action, you must respond with:

1. A narrative description of what happens
2. A structured data block in the following format:

\`\`\`json
{
  "narrative": "Your descriptive response",
  "effects": {
    "health_change": number (positive for healing, negative for damage),
    "discovered_features": ["array of new features found"],
    "knowledge_gained": ["array of new information learned"],
    "inventory_changes": {
      "add": ["items to add to inventory"],
      "remove": ["items to remove from inventory"]
    }
  },
  "available_actions": ["list", "of", "suggested", "actions"]
}
\`\`\`

Important:
- Always include the structured json block
- Health changes must be numbers (positive for healing, negative for damage)
- When items are picked up or dropped, include them in inventory_changes
- Available actions should be 2-4 logical next steps based on the situation
- Keep narrative responses engaging but concise`;

  async function processUserInput(input) {
    try {
      // Build context for LLM
      const context = buildContext(gameState, input);
      
      // Get LLM response
      const response = await ollama.chat({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(context, null, 2) }
        ]
      });

      // Parse and process response
      const result = parseResponse(response.message.content);
      
      // Update game state
      const gameStatus = gameState.updateState(result.effects);
      
      // Display narrative
      console.log('\n' + result.narrative + '\n');
      
      // Display available actions if present
      if (result.available_actions) {
        console.log('Available actions:', result.available_actions.join(', ') + '\n');
      }

      // Update transcript (with size limit)
      gameState.transcript += `\nPlayer: ${input}\nGM: ${result.narrative}\n`;
      if (gameState.transcript.length > CONTEXT_SIZE) {
        gameState.transcript = gameState.transcript.slice(-CONTEXT_SIZE);
      }

      return gameStatus;
    } catch (error) {
      console.error('Error processing input:', error);
      return 'CONTINUE';
    }
  }

  function displayStatus(gameState) {
    console.log('\n=== Character Status ===');
    console.log(`Health: ${gameState.character.stats.health}`);
    console.log('\n=== Location ===');
    console.log(`Current Location: ${gameState.world.current_location.name}`);
    console.log(`Description: ${gameState.world.current_location.description}`);
    console.log('\nFeatures:', gameState.world.current_location.features.join(', '));
    
    console.log('\n=== Inventory ===');
    if (gameState.character.stats.inventory.length > 0) {
      console.log(gameState.character.stats.inventory.join(', '));
    } else {
      console.log('Empty');
    }
    
    if (gameState.character.history.length > 0) {
      console.log('\n=== Recent Discoveries ===');
      gameState.character.history.slice(-3).forEach(event => {
        console.log(`- ${event.details}`);
      });
    }
    
    if (gameState.world.active_quests.length > 0) {
      console.log('\n=== Active Quests ===');
      console.log(gameState.world.active_quests.join('\n'));
    }
    console.log('\n===================\n');
  }

  async function gameLoop() {
    return new Promise((resolve) => {
      rl.question('\nWhat would you like to do? (type ".status" for character info, ".exit" or ".quit" to end): ', async (input) => {
        if (input.toLowerCase() === '.exit' || input.toLowerCase() === '.quit') {
          resolve('EXIT');
          return;
        }

        if (input.toLowerCase() === '.status') {
          displayStatus(gameState);
          resolve(await gameLoop());
          return;
        }

        const gameStatus = await processUserInput(input);
        
        if (gameStatus === 'GAME_OVER') {
          console.log('\nGame Over! Your health has reached 0.');
          resolve('EXIT');
          return;
        }

        resolve(await gameLoop());
      });
    });
  }

  await gameLoop();
  rl.close();
}

// Start game with command line argument or default genre
const genre = process.argv[2] || 'fantasy';
if (!GENRES[genre]) {
  console.error(`Unknown genre: ${genre}`);
  console.log(`Available genres: ${Object.keys(GENRES).join(', ')}`);
  process.exit(1);
}

runGame(genre).then(() => {
  console.log('\nThanks for playing!');
  process.exit(0);
});
