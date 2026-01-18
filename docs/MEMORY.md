# Memory System Architecture

## Overview

ThinkCompanion's memory system is designed around three time-based layers, each serving a different purpose in creating a persistent, contextual AI companion.

## Three-Layer Architecture

### Layer 1: Short-Term Memory (Hours - Days)

**Purpose**: Maintain conversation coherence and immediate context

**Retention Period**: Current session + last 2-3 sessions

**Storage**:
- PostgreSQL: `messages` table with `session_id`
- In-memory: Active session cache

**Data Stored**:
- Raw conversation messages
- Session metadata (start time, topics)
- Immediate context window

**Use Cases**:
- Reference previous messages in conversation
- Maintain topic continuity
- Understand pronoun references ("that", "it", "the project we discussed")

**Example Query**:
```sql
SELECT * FROM messages 
WHERE session_id = $1 
ORDER BY created_at DESC 
LIMIT 20;
```

### Layer 2: Medium-Term Memory (Weeks - Months)

**Purpose**: Track active goals, recent learning, current projects

**Retention Period**: 30-90 days rolling window

**Storage**:
- PostgreSQL: Active goals, recent skill updates, confusion patterns
- Pinecone: Vector embeddings of last 90 days

**Data Stored**:
- Active goals and their progress
- Recent skill level changes
- Emerging confusion patterns
- Current focus areas
- Recent decisions and outcomes

**Use Cases**:
- Track progress toward goals
- Identify learning patterns
- Adapt teaching approach
- Reference recent discussions

**Example Query**:
```sql
SELECT * FROM goals 
WHERE user_id = $1 
  AND status = 'active'
  AND created_at > NOW() - INTERVAL '90 days';
```

**Vector Search**:
```typescript
// Find relevant memories from last 90 days
const results = await vectorService.search(userId, query, {
  topK: 10,
  filter: {
    timestamp: { $gte: ninetyDaysAgo }
  }
});
```

### Layer 3: Long-Term Memory (Years)

**Purpose**: Core identity, persistent knowledge, growth trajectory

**Retention Period**: Indefinite (with periodic compression)

**Storage**:
- PostgreSQL: Compressed summaries, stable preferences, personality notes
- Pinecone: Key insights and milestone embeddings

**Data Stored**:
- Core interests and values
- Communication preferences
- Personality traits
- Long-term goals
- Skill progression over time
- Significant milestones
- Compressed session summaries

**Use Cases**:
- Understand user's core identity
- Maintain consistent personality model
- Track long-term growth
- Reference past achievements

**Example Query**:
```sql
SELECT * FROM memory_summaries 
WHERE user_id = $1 
  AND memory_type = 'long_term';
```

## Memory Storage Process

### 1. Message Received
```typescript
// User sends message
const message = "How do I use async/await in TypeScript?";
```

### 2. Generate Embedding
```typescript
// Create vector embedding
const embedding = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: message
});
```

### 3. Store in Vector DB
```typescript
// Store in Pinecone with metadata
await pinecone.upsert({
  id: `${userId}-${messageId}`,
  values: embedding.data[0].embedding,
  metadata: {
    userId,
    sessionId,
    text: message,
    role: 'user',
    timestamp: new Date().toISOString(),
    topics: ['typescript', 'async']
  }
});
```

### 4. Store in PostgreSQL
```typescript
// Store message with embedding reference
await supabase.from('messages').insert({
  id: messageId,
  user_id: userId,
  session_id: sessionId,
  role: 'user',
  content: message,
  embedding_id: embeddingId,
  created_at: new Date()
});
```

### 5. Extract Patterns
```typescript
// Background: Analyze for patterns
if (isConfusionPattern(message, history)) {
  await supabase.from('confusion_patterns').insert({
    user_id: userId,
    topic: 'async-programming',
    pattern_description: 'Repeatedly asks about async/await',
    frequency: existingPattern ? existingPattern.frequency + 1 : 1
  });
}
```

## Memory Retrieval Process

### 1. User Query
```typescript
const query = "Can you help me with promises?";
```

### 2. Generate Query Embedding
```typescript
const queryEmbedding = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: query
});
```

### 3. Vector Search
```typescript
// Find semantically similar memories
const results = await pinecone.query({
  vector: queryEmbedding.data[0].embedding,
  topK: 5,
  filter: { userId }
});
```

### 4. Retrieve Full Context
```typescript
// Get full messages from PostgreSQL
const memories = await Promise.all(
  results.matches.map(match => 
    supabase
      .from('messages')
      .select('*')
      .eq('embedding_id', match.id)
      .single()
  )
);
```

### 5. Include in LLM Context
```typescript
const systemPrompt = `
User context:
- Previously discussed: ${memories.map(m => m.content).join(', ')}
- Known confusion pattern: struggles with promises
- Skill level: 6/10 in JavaScript
`;
```

## Memory Compression (Phase 2)

### Why Compress?

- Reduce storage costs
- Improve search performance
- Maintain long-term context without bloat

### Compression Process

```
Weekly Job:
1. Collect last week's messages
2. Generate summary using LLM:
   "User worked on project X, learned about Y, struggled with Z"
3. Create embedding of summary
4. Store in memory_summaries table
5. Archive or delete raw messages
6. Update long-term memory
```

### Compression Prompt
```
Summarize the following week of conversations:
- Key topics discussed
- Progress made on goals
- New skills learned
- Confusion patterns observed
- Important decisions made

Messages: {messages}
```

## Memory Search Strategies

### 1. Semantic Search
Find conceptually similar past discussions:
```typescript
const results = await vectorService.search(userId, 
  "error handling in async code", 
  { topK: 10 }
);
```

### 2. Temporal Search
Find memories from a specific time period:
```typescript
const results = await memoryService.searchMemories(userId, query, {
  timeRange: {
    start: '2024-01-01',
    end: '2024-01-31'
  }
});
```

### 3. Hybrid Search
Combine semantic and metadata filtering:
```typescript
const results = await vectorService.search(userId, query, {
  topK: 10,
  filter: {
    topics: { $in: ['typescript', 'async'] },
    role: 'user',
    timestamp: { $gte: lastMonth }
  }
});
```

## Memory Privacy & Security

### User Data Ownership
- Users own all their memory data
- Full export capability
- Complete deletion on request

### Row Level Security
```sql
-- Users can only access their own memories
CREATE POLICY "Users see own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);
```

### Encryption
- Data encrypted at rest (Supabase/Pinecone)
- Encrypted in transit (HTTPS)
- Vector embeddings are anonymized

## Memory Statistics

Track memory health and usage:

```typescript
interface MemoryStats {
  total_messages: number;
  total_sessions: number;
  memory_span_days: number;
  active_goals: number;
  tracked_skills: number;
  confusion_patterns: number;
  last_compression_date: string;
}
```

## Future Enhancements (Phase 3+)

### Adaptive Retention
- Keep important memories longer
- Compress less relevant memories sooner
- User-configurable retention policies

### Memory Graphs
- Connect related memories
- Track concept evolution
- Visualize knowledge growth

### Shared Memories
- Team workspaces (enterprise)
- Shared context across users
- Collaborative learning

### Memory Search UI
- Visual timeline of memories
- Filter by topic, goal, skill
- Highlight key insights

## Performance Considerations

### Indexing
```sql
-- Fast user-scoped queries
CREATE INDEX idx_messages_user_created 
  ON messages(user_id, created_at DESC);

CREATE INDEX idx_memory_summaries_user_type 
  ON memory_summaries(user_id, memory_type);
```

### Caching (Phase 2)
```typescript
// Cache frequently accessed memories
const cached = await redis.get(`user:${userId}:recent_memories`);
if (cached) return JSON.parse(cached);
```

### Batch Operations
```typescript
// Batch embed multiple messages
const embeddings = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: messages.map(m => m.content)
});
```

## Testing Memory System

### Unit Tests
- Test memory storage
- Test retrieval accuracy
- Test compression logic

### Integration Tests
- Test vector search
- Test database queries
- Test memory consistency

### Quality Tests
- Measure retrieval relevance
- Test compression quality
- Verify pattern detection
