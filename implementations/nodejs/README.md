# YIKES Node.js Implementation

This is a Node.js implementation of YIKES (Your Infinite Knowledge Entertainment System) that demonstrates the context engineering approach for LLM-powered text adventures.

## Features

- Structured context management
- State tracking (health, inventory, discoveries)
- JSON-based communication protocol
- Multiple genre support (fantasy, sci-fi)

## Prerequisites

- Node.js
- Ollama with dolphin3:8b model installed

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the game:
```bash
node yikes.mjs [fantasy|scifi]
```

## Implementation Details

This implementation follows the YIKES context engineering recommendations:

1. **Structured Context**
   - Hierarchical organization (system, world, character)
   - Clean state management through GameState class
   - Conversation history with size limits

2. **State Management**
   - Health tracking
   - Inventory system
   - Discovery logging
   - Feature tracking

3. **Communication Protocol**
   ```javascript
   {
     "narrative": "Description of what happens",
     "effects": {
       "health_change": number,
       "discovered_features": ["array of new features"],
       "knowledge_gained": ["array of new information"],
       "inventory_changes": {
         "add": ["items to add"],
         "remove": ["items to remove"]
       }
     },
     "available_actions": ["possible", "next", "actions"]
   }
   ```

4. **Error Handling**
   - Response validation
   - Graceful fallbacks
   - State consistency checks

## Commands

- `.status` - Display character status, inventory, and recent discoveries
- `.exit` or `.quit` - End the game
