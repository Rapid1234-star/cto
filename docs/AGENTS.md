# Multi-Agent Architecture

## Overview

ThinkCompanion uses a multi-agent architecture to process user messages thoughtfully and generate contextual responses. Each agent has a specific role and they coordinate to produce intelligent, personalized interactions.

## Agent Roles

### 1. Listener Agent
**Purpose**: Analyze user input

**Responsibilities**:
- Extract intent from user message
- Identify topics and keywords
- Detect emotional tone
- Assess complexity level
- Determine if memory lookup is needed

**Output**:
```typescript
{
  intent: "asking_for_help" | "clarification" | "discussion" | "update",
  topics: ["typescript", "async"],
  emotion_detected: "frustrated" | "curious" | null,
  complexity_level: 7,
  requires_memory_lookup: true,
  requires_goal_context: true
}
```

### 2. Memory Agent
**Purpose**: Manage memory operations

**Responsibilities**:
- Search vector database for relevant memories
- Retrieve user context (goals, skills, patterns)
- Determine what needs to be stored
- Update skill levels and patterns

**Output**:
```typescript
{
  relevant_memories: ["previous discussion about async...", ...],
  new_memories_to_store: [
    { content: "User struggling with promises", type: "pattern" }
  ],
  skill_updates: [
    { topic: "async-javascript", new_level: 6 }
  ]
}
```

### 3. Planner Agent
**Purpose**: Plan response strategy

**Responsibilities**:
- Determine response approach
- Plan content structure
- Set appropriate tone and depth
- Identify if clarification is needed

**Output**:
```typescript
{
  response_strategy: "educational_with_examples",
  key_points: ["Explain promises", "Show async/await", "Common mistakes"],
  tone: "supportive",
  depth: "detailed",
  should_ask_clarifying_questions: false,
  memory_writes_needed: ["confusion_pattern", "skill_update"]
}
```

### 4. Tutor Agent
**Purpose**: Generate educational content

**Responsibilities**:
- Create clear explanations
- Generate relevant examples
- Develop analogies
- Suggest follow-up topics

**Output**:
```typescript
{
  explanation: "Let me explain async/await...",
  examples: ["const data = await fetch()...", ...],
  analogies: ["Think of promises like ordering food...", ...],
  follow_up_suggestions: ["Error handling", "Promise.all"]
}
```

### 5. Critic Agent
**Purpose**: Review and refine

**Responsibilities**:
- Assess response quality
- Check for clarity and accuracy
- Identify potential issues
- Suggest improvements

**Output**:
```typescript
{
  quality_score: 8,
  suggestions: ["Add visual example", "Simplify terminology"],
  potential_issues: [],
  approved: true
}
```

### 6. Execution Agent
**Purpose**: Execute final response

**Responsibilities**:
- Compile final response
- Store memories and updates
- Log actions taken
- Return response to user

**Output**:
```typescript
{
  final_response: "Here's how async/await works...",
  memory_stored: true,
  profile_updated: true,
  actions_taken: ["stored_message", "updated_skill", "noted_pattern"]
}
```

### 7. Orchestrator Agent
**Purpose**: Coordinate all agents

**Responsibilities**:
- Manage agent communication
- Optimize execution order
- Handle errors and retries
- Aggregate results

## Agent Communication Flow

```
User Message
    ↓
┌───────────────────────────────────────────┐
│         Orchestrator Receives              │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  Listener Analyzes → Returns Analysis      │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  Memory Searches → Returns Context         │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  Planner Plans → Returns Strategy          │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  Tutor Generates → Returns Content         │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  Critic Reviews → Returns Feedback         │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  Execution Executes → Returns Response     │
└───────────────────────────────────────────┘
    ↓
Response to User
```

## Phase 1 Implementation

Phase 1 uses a **simplified single-agent approach**:
- All logic consolidated in Agent Service
- Direct LLM call with context
- Manual memory storage
- Basic pattern recognition

## Phase 2 Implementation (Future)

Phase 2 will implement **full multi-agent orchestration**:
- Individual agent implementations
- Agent-to-agent communication
- Parallel processing where possible
- Advanced pattern recognition
- Adaptive learning from agent interactions

## Agent Prompt Templates (Phase 2)

### Listener Prompt
```
Analyze the following user message and extract:
- Primary intent
- Topics discussed
- Emotional tone
- Complexity level (1-10)

User message: "{message}"
User context: {context}
```

### Planner Prompt
```
Given the analysis and context, plan a response strategy:
- What type of response is needed?
- What depth and tone?
- Should we ask clarifying questions?

Analysis: {listener_output}
Context: {context}
```

### Tutor Prompt
```
Generate educational content following this plan:
{planner_output}

User's learning preferences: {preferences}
Skill level: {skill_level}
```

## Benefits of Multi-Agent Architecture

1. **Separation of Concerns**: Each agent focuses on one task
2. **Flexibility**: Easy to improve individual agents
3. **Testability**: Test agents independently
4. **Scalability**: Parallelize agent execution
5. **Transparency**: Track decision-making process
6. **Adaptability**: Agents can learn and improve over time

## Implementation Notes

- Agents communicate via structured messages
- Orchestrator manages timeouts and errors
- Agents can request information from each other
- System tracks agent performance metrics
- Failed agents can be retried or skipped
