# LLM Communication in YIKES

## Current Implementation

### Overview
YIKES currently uses a template-based context engineering approach to communicate with LLM models through the Ollama API. The system maintains game state and injects it into a structured prompt template for each interaction.

### Context Structure

The context provided to the LLM includes:

1. **Conversation History**
   - Maintained in the `transcript` field
   - Provides conversation continuity
   - Limited by CONTEXT_SIZE (16384 tokens)

2. **Character Information**
   - Detailed character attributes (name, race, sex, age, occupation)
   - Physical description (2-3 sentences of distinctive features)
   - Backstory (3-4 sentences of character history)
   - Stats (health, strength, wisdom, dexterity, charisma)

3. **Game State**
   - Current location
   - Inventory items
   - Currency amount and type
   - Health status

4. **Player Input**
   - The most recent user action/command

### Communication Protocol

1. **Prompt Assembly**
   - Uses a structured template (PROMPT_TEMPLATE)
   - Replaces placeholders with current game state
   - Maintains consistent formatting for LLM parsing

2. **LLM Interaction**
   - Uses Ollama chat API
   - Currently configured for dolphin3:8b model
   - Implements rate limiting (100ms minimum delay between calls)

3. **Response Parsing**
   - Extracts narrative content
   - Processes special macros (e.g., HEALTH_SUBTRACT for damage)

### Sample Exchange

Below is an example exchange between YIKES and the LLM, showing how context and responses are structured:

1. **Context Sent to LLM:**
```
Transcript:
You find yourself in front of a ruined Wizard's Tower. The ancient stone structure looms before you, its upper levels crumbling and covered in ivy. The wooden door appears to be intact, though weathered by time.

Character:
  Name: Eldrin Moonshadow
  Race: Elf
  Sex: Male
  Age: 132
  Occupation: Mage
  Description: Eldrin is a tall, slender elf with silver-white hair that falls past his shoulders. His emerald eyes seem to shimmer with an inner light, and he bears an intricate tattoo of arcane symbols along his left forearm.
  Backstory: Eldrin was once an apprentice at the prestigious Academy of Silvermist, but left after discovering forbidden knowledge in the restricted archives. He now wanders the realm seeking to understand the ancient magics that others fear to study, driven by an insatiable curiosity that often outweighs caution.

Location: In front of a ruined Wizard's Tower
Health: 100
Strength: 10
Wisdom: 16
Dexterity: 14
Charisma: 12
gold: 75
Inventory: spellbook, silver dagger, healing potion

Player Input:
I want to examine the door for any magical symbols or traps.
```

2. **LLM Response:**
```
As you approach the weathered door, you draw upon your magical training to carefully examine its surface. Your keen elven eyes and arcane knowledge prove useful - you notice faint, almost invisible runes etched into the door frame. They appear to be protective wards, though their power has largely faded with time. However, one symbol near the door handle still pulses with a weak magical energy that suggests a minor shocking trap, likely meant to deter casual intruders.

Your wisdom and magical background tell you that while the trap is still active, it's significantly weakened. Attempting to disable it would be relatively safe for someone with your expertise, though there's still a small risk of triggering it. You could also try to simply open the door and endure what would likely be a mild shock.

The door itself appears sturdy despite its age, reinforced with bands of iron that show no signs of rust - possibly preserved by the lingering magical energies.
```

3. **Parsed Effects:**
- No health reduction (no HEALTH_SUBTRACT macro)
- Identified environmental elements: magical trap, door condition
- Provided multiple action possibilities based on character skills

This exchange demonstrates how:
- Character background influences the response (magical knowledge)
- Stats affect available information (wisdom, occupation)
- The LLM maintains narrative consistency with the setting
- Game mechanics (health) integrate with narrative elements

## Recommendations for Higher Fidelity

### 1. Enhanced Context Engineering

1. **Hierarchical Context Structure**
   ```javascript
   {
     system: {
       role: "Game Master",
       rules: [...],
       constraints: [...]
     },
     character: {
       current: {...},
       history: [...],
       relationships: [...]
     },
     world: {
       current_location: {...},
       known_locations: [...],
       active_quests: [...]
     }
   }
   ```

2. **Dynamic Context Pruning**
   - Implement relevance scoring for historical events
   - Maintain most relevant context within token limits
   - Archive less relevant information for potential recall

### 2. Improved Response Structure

1. **Structured Output Format**
   ```javascript
   {
     narrative: "Description of what happens",
     effects: {
       health_change: -5,
       inventory_changes: [...],
       location_change: null,
       state_updates: {...}
     },
     metadata: {
       tone: "dramatic",
       tension_level: 7,
       available_actions: [...]
     }
   }
   ```

2. **Action Validation**
   - Pre-validate possible actions based on character state
   - Include action constraints in system prompt
   - Implement confirmation for critical actions

### 3. Memory Management

1. **Long-term Memory**
   - Implement summarization of past events
   - Store important character milestones
   - Track relationship development
   - Maintain quest progress

2. **Short-term Context**
   - Recent interactions and immediate state
   - Current environment details
   - Active conditions or effects

### 4. Enhanced Error Handling

1. **Graceful Degradation**
   - Fallback responses for API failures
   - Context recovery mechanisms
   - State validation and repair

2. **Response Validation**
   - Schema validation for LLM responses
   - Consistency checking with game state
   - Automatic correction of invalid state changes

### 5. Model-specific Optimizations

1. **Prompt Engineering**
   - Model-specific prompt templates
   - Fine-tuned system messages
   - Optimized token usage

2. **Temperature Control**
   - Dynamic adjustment based on scene type
   - Consistency vs creativity balancing
   - Contextual randomness control

## Implementation Priority

1. Structured Output Format
   - Immediate improvement in response reliability
   - Foundation for advanced features

2. Enhanced Context Engineering
   - Better conversation coherence
   - Improved state management

3. Memory Management
   - Long-term narrative consistency
   - Rich character development

4. Error Handling
   - System stability
   - User experience improvement

5. Model Optimizations
   - Performance tuning
   - Response quality enhancement

## Example: Future Implementation

To illustrate how the recommendations would improve the system, here's the same exchange using the proposed enhancements:

1. **Enhanced Context Sent to LLM:**
```javascript
{
  "system": {
    "role": "Game Master",
    "rules": [
      "Respond in character as a narrative GM",
      "Consider character abilities and stats",
      "Maintain consistent world state",
      "Signal state changes through structured format"
    ],
    "constraints": [
      "Cannot introduce new major locations without setup",
      "Actions must respect character abilities",
      "Maintain consistent magic system rules"
    ]
  },
  "character": {
    "current": {
      "name": "Eldrin Moonshadow",
      "race": "Elf",
      "sex": "Male",
      "age": 132,
      "occupation": "Mage",
      "description": "Tall, slender elf with silver-white hair and emerald eyes. Bears arcane tattoos on left forearm.",
      "backstory": "Former apprentice at Silvermist Academy, left after discovering forbidden knowledge. Seeks understanding of ancient magics.",
      "stats": {
        "health": 100,
        "strength": 10,
        "wisdom": 16,
        "dexterity": 14,
        "charisma": 12
      }
    },
    "history": [
      {
        "type": "background_event",
        "description": "Discovered forbidden knowledge at Silvermist Academy",
        "relevance_score": 0.8
      },
      {
        "type": "skill",
        "description": "Extensive training in identifying magical runes and wards",
        "relevance_score": 0.9
      }
    ],
    "relationships": []
  },
  "world": {
    "current_location": {
      "name": "Ruined Wizard's Tower",
      "description": "Ancient stone structure with crumbling upper levels covered in ivy. Wooden door intact but weathered.",
      "notable_features": ["weathered wooden door", "ivy-covered walls", "crumbling upper levels"],
      "known_hazards": []
    },
    "known_locations": [],
    "active_quests": [],
    "inventory": ["spellbook", "silver dagger", "healing potion"],
    "currency": {
      "type": "gold",
      "amount": 75
    }
  },
  "recent_context": {
    "last_action": null,
    "current_conditions": [],
    "immediate_threats": []
  }
}

Player Input: I want to examine the door for any magical symbols or traps.
```

2. **Structured LLM Response:**
```javascript
{
  "narrative": "As you approach the weathered door, you draw upon your magical training to carefully examine its surface. Your keen elven eyes and arcane knowledge prove useful - you notice faint, almost invisible runes etched into the door frame. They appear to be protective wards, though their power has largely faded with time. However, one symbol near the door handle still pulses with a weak magical energy that suggests a minor shocking trap, likely meant to deter casual intruders.\n\nYour wisdom and magical background tell you that while the trap is still active, it's significantly weakened. Attempting to disable it would be relatively safe for someone with your expertise, though there's still a small risk of triggering it. You could also try to simply open the door and endure what would likely be a mild shock.\n\nThe door itself appears sturdy despite its age, reinforced with bands of iron that show no signs of rust - possibly preserved by the lingering magical energies.",
  "effects": {
    "health_change": 0,
    "inventory_changes": [],
    "location_change": null,
    "state_updates": {
      "discovered_features": ["magical trap", "protective wards", "preserved iron bands"],
      "knowledge_gained": ["door trap mechanics", "ward deterioration"]
    }
  },
  "metadata": {
    "tone": "investigative",
    "tension_level": 3,
    "available_actions": [
      {
        "action": "disable_trap",
        "difficulty": "medium",
        "risk_level": "low",
        "requirements": {
          "wisdom": 14,
          "occupation": ["Mage", "Rogue"]
        }
      },
      {
        "action": "force_door",
        "difficulty": "easy",
        "risk_level": "medium",
        "effects": {
          "guaranteed_damage": 5
        }
      },
      {
        "action": "examine_further",
        "difficulty": "easy",
        "risk_level": "none"
      }
    ]
  }
}
```

3. **System Processing:**
- Validates response structure against schema
- Updates world state with discovered features
- Records knowledge gained for future reference
- Adds available actions to action validation system
- Maintains narrative consistency by checking against constraints
- Updates relevance scores for character history items

This enhanced implementation demonstrates:
- Rich contextual awareness through hierarchical structure
- Explicit action validation and consequences
- Detailed state tracking and updates
- Metadata for narrative control
- Clear separation of narrative and mechanical elements

The structured format enables:
- More consistent and reliable responses
- Better state management
- Richer gameplay possibilities
- Improved error handling
- Enhanced narrative coherence
