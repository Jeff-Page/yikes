# YIKES (Your Infinite Knowledge Entertainment System)

YIKES is a framework for creating LLM-powered text adventures using context engineering. It provides a structured approach to maintaining game state and communicating with language models, enabling rich, interactive storytelling experiences.

```
                                    Context Engineering Flow
                                    
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Game State     │     │    LLM Response     │     │   State Update   │
│ ─────────────    │     │   ─────────────     │     │  ─────────────   │
│ - System         │     │ {                   │     │ - Parse Effects  │
│ - Character      │──►  │   narrative: "...", │──►  │ - Update State   │
│ - World          │     │   effects: {...},   │     │ - Save History   │
│ - History        │     │   actions: [...]    │     │ - Validate       │
└──────────────────┘     │ }                   │     └──────────────────┘
         ▲               └─────────────────────┘              │
         │                                                    │
         └────────────────────────────────────────────────────┘
                            State Feedback Loop

┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│  User Input     │          │  Game Master    │          │    Response     │
│ ──────────      │          │  ──────────     │          │   ──────────    │
│ "look around"   │───────►  │ Context-aware   │───────►  │ Rich narrative  │
│ "take sword"    │          │ State-tracking  │          │ State changes   │
│ "talk to NPC"   │          │ Rule-enforcing  │          │ New actions     │
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

## Context Engineering Requirements

### 1. State Management

The system must maintain a hierarchical state structure:

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

### 2. Communication Protocol

All interactions with the LLM must use a structured format:

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

### 3. Core Features

Any implementation must support:

1. **State Tracking**
   - Health/status management
   - Inventory system
   - Discovery logging
   - Feature tracking

2. **Error Handling**
   - Response validation
   - Graceful fallbacks
   - State consistency checks

3. **Basic Commands**
   - Status display
   - Game exit
   - Help system

## Implementation Guidelines

1. **State Updates**
   - Validate all state changes
   - Maintain state consistency
   - Handle edge cases gracefully

2. **Response Processing**
   - Parse structured responses
   - Handle missing or malformed data
   - Maintain conversation context

3. **User Interface**
   - Clear status display
   - Intuitive command system
   - Helpful error messages

## Available Implementations

- [Node.js](implementations/nodejs/README.md) - Reference implementation using Ollama

## Contributing

We welcome new implementations in different languages and frameworks. When contributing:

1. Create a new directory under `implementations/`
2. Include a README with:
   - Setup instructions
   - Dependencies
   - Usage examples
   - Implementation-specific details

3. Follow the core requirements:
   - Structured state management
   - Standard communication protocol
   - Required features implementation

## License

ISC License - See [LICENSE.md](LICENSE.md) for details.
