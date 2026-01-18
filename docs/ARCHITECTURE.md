# ThinkCompanion Architecture

## System Overview

ThinkCompanion is a persistent personal AI cognitive companion built with a modern, scalable architecture. The system is designed around three core principles:

1. **Continuity** - Persistent memory across sessions
2. **Adaptivity** - Learning and adapting to user patterns
3. **Intelligence** - Multi-agent coordination for thoughtful responses

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Next.js 14 Frontend (Vercel)                            │  │
│  │   - React components                                       │  │
│  │   - Particle background                                    │  │
│  │   - Real-time chat interface                               │  │
│  │   - Auth management                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Fastify Backend (Railway)                               │  │
│  │   - RESTful API                                            │  │
│  │   - Streaming responses                                    │  │
│  │   - JWT authentication                                     │  │
│  │   - Rate limiting                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Auth      │  │   Memory    │  │   Agent     │            │
│  │  Service    │  │  Service    │  │ Orchestrator│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   User      │  │   Vector    │  │    LLM      │            │
│  │  Service    │  │  Service    │  │  Service    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│                                                                   │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐        │
│  │  PostgreSQL  │  │   Pinecone    │  │   OpenAI     │        │
│  │  (Supabase)  │  │  (Vectors)    │  │    (LLM)     │        │
│  │              │  │               │  │              │        │
│  │  - Users     │  │  - Embeddings │  │  - GPT-4     │        │
│  │  - Sessions  │  │  - Semantic   │  │  - Ada-002   │        │
│  │  - Messages  │  │    Search     │  │              │        │
│  │  - Goals     │  └───────────────┘  └──────────────┘        │
│  │  - Skills    │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend (Next.js 14)

**Technology**: Next.js 14 with App Router, React 18, TypeScript, Tailwind CSS

**Key Features**:
- Server-side rendering for initial page loads
- Client-side navigation for smooth UX
- Particle background using tsparticles
- Real-time streaming chat interface
- Magic link authentication
- Responsive design (mobile-first)

**Structure**:
```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing page with particle background
├── chat/
│   ├── layout.tsx          # Chat layout with sidebar
│   └── page.tsx            # Main chat interface
├── auth/
│   ├── signin/page.tsx     # Sign-in page
│   └── callback/route.ts   # Auth callback handler
```

**State Management**:
- React hooks for local state
- Context API for global auth state
- Local storage for token persistence

### Backend (Fastify + Node.js)

**Technology**: Fastify, TypeScript, Node.js 18+

**Key Features**:
- High-performance async request handling
- Streaming responses for real-time chat
- JWT-based authentication
- Rate limiting and security middleware
- Structured logging with Pino
- Error handling with custom error classes

**Structure**:
```
src/
├── config/           # Environment and service configuration
├── routes/           # API route handlers
├── services/         # Business logic layer
├── middleware/       # Authentication, logging, error handling
├── utils/            # Helper functions and utilities
└── server.ts         # Main application entry point
```

**Request Flow**:
```
Request → Middleware (auth, logging, rate limit)
       → Route Handler
       → Service Layer (business logic)
       → Data Layer (DB, Vector, LLM)
       → Response
```

### Database (PostgreSQL + Supabase)

**Technology**: PostgreSQL 15, Supabase for managed hosting + RLS

**Schema Overview**:
- **users** - Core user accounts
- **user_profiles** - Extended user information and preferences
- **goals** - User goals and objectives
- **focus_areas** - Current areas of focus
- **skill_levels** - Tracked skill proficiency
- **confusion_patterns** - Identified learning patterns
- **sessions** - Chat sessions
- **messages** - Individual chat messages
- **memory_summaries** - Compressed memory across time ranges
- **decisions_log** - Important user decisions
- **personality_notes** - Observed personality traits

**Security**:
- Row Level Security (RLS) ensures users only access their own data
- Service role key for backend operations
- Anon key for client operations (limited)

### Vector Database (Pinecone)

**Technology**: Pinecone serverless index

**Configuration**:
- Dimension: 1536 (OpenAI ada-002 embeddings)
- Metric: Cosine similarity
- Cloud: AWS us-east-1

**Usage**:
- Store message embeddings for semantic search
- Query relevant memories based on current context
- Enable pattern recognition across conversations

**Metadata Storage**:
```typescript
{
  userId: string,
  text: string,
  timestamp: string,
  sessionId: string,
  role: 'user' | 'assistant',
  type: string
}
```

### LLM Integration (OpenAI)

**Models**:
- **GPT-4 Turbo** - Main conversation model
- **text-embedding-ada-002** - Embeddings for semantic search

**Features**:
- Streaming responses for real-time UX
- Context-aware prompts with user preferences
- Retry logic with exponential backoff
- Token usage tracking

## Data Flow

### Chat Message Flow

```
1. User sends message
   ↓
2. Frontend → POST /chat
   ↓
3. Backend authenticates request
   ↓
4. Agent Service orchestrates:
   a. Build user context (profile, goals, recent memory)
   b. Search vector DB for relevant memories
   c. Generate system prompt with context
   d. Stream LLM response
   ↓
5. Store message + embedding in DB
   ↓
6. Update user model (skills, patterns)
   ↓
7. Stream response chunks to frontend
   ↓
8. Frontend displays message in real-time
```

### Memory Storage Flow

```
1. Message received
   ↓
2. Generate embedding via OpenAI ada-002
   ↓
3. Store embedding in Pinecone with metadata
   ↓
4. Store message in PostgreSQL with embedding_id
   ↓
5. Background: Analyze for patterns
   ↓
6. Update user profile if needed
   (e.g., skill level change, new confusion pattern)
```

### Memory Retrieval Flow

```
1. User sends new message
   ↓
2. Generate query embedding
   ↓
3. Search Pinecone for top K similar vectors
   ↓
4. Retrieve matching messages from PostgreSQL
   ↓
5. Include in LLM context
   ↓
6. Generate contextually-aware response
```

## Multi-Agent Orchestration

**Agent Roles** (Phase 2 implementation):

1. **Listener Agent**
   - Analyzes user input for intent and emotion
   - Identifies topics and complexity level
   - Determines if memory lookup is needed

2. **Memory Agent**
   - Searches relevant memories
   - Manages memory read/write operations
   - Determines skill and pattern updates

3. **Planner Agent**
   - Plans response strategy and structure
   - Determines tone and depth
   - Decides if clarification is needed

4. **Tutor Agent**
   - Generates educational content
   - Creates examples and analogies
   - Adapts to user's learning style

5. **Critic Agent**
   - Reviews generated responses
   - Ensures quality and appropriateness
   - Provides refinement suggestions

6. **Execution Agent**
   - Executes final response
   - Stores memory and updates
   - Tracks actions taken

7. **Orchestrator Agent**
   - Coordinates all agents
   - Manages message passing
   - Ensures efficient execution

**Agent Communication Flow** (Phase 2):
```
User Message
    ↓
Listener → Memory → Planner → Tutor → Critic → Execution
    ↑         ↓         ↓         ↓       ↓         ↓
    └─────────────── Orchestrator ────────────────┘
```

## Three-Layer Memory Architecture

### Short-Term Memory (Hours - Days)

**Purpose**: Session context and immediate conversation history

**Storage**:
- In-memory session cache
- Recent messages in session
- Current conversation topics

**Retention**: Current session + last few sessions

**Usage**: Maintain conversation coherence

### Medium-Term Memory (Weeks - Months)

**Purpose**: Active goals, recent learning, current projects

**Storage**:
- PostgreSQL: Recent goals, skill updates
- Pinecone: Last 30-90 days of embeddings

**Retention**: 30-90 days rolling window

**Usage**:
- Track active goals progress
- Monitor recent skill development
- Identify emerging patterns

### Long-Term Memory (Years)

**Purpose**: Core identity, persistent knowledge, growth trajectory

**Storage**:
- PostgreSQL: Compressed summaries, core preferences
- Pinecone: Key insights (compressed periodically)

**Retention**: Indefinite (with compression)

**Usage**:
- Understand user's core interests
- Track long-term growth
- Maintain consistent personality understanding

### Memory Compression (Phase 2)

**Process**:
1. Periodically (e.g., weekly) summarize medium-term memories
2. Extract key insights and patterns
3. Compress into long-term summaries
4. Archive or delete raw messages from medium-term
5. Maintain searchable index of compressed memories

## Authentication Flow

### Magic Link Flow

```
1. User enters email on signin page
   ↓
2. Frontend → POST /auth/magic-link
   ↓
3. Backend generates OTP via Supabase
   ↓
4. Supabase sends email with magic link
   ↓
5. User clicks link → redirects to /auth/callback?token=...
   ↓
6. Frontend → POST /auth/verify
   ↓
7. Backend verifies token with Supabase
   ↓
8. Backend creates/updates user in database
   ↓
9. Return JWT tokens (access + refresh)
   ↓
10. Frontend stores tokens in localStorage
   ↓
11. Redirect to /chat
```

### OAuth Flow (Future)

```
1. User clicks "Sign in with Google/GitHub"
   ↓
2. Redirect to OAuth provider
   ↓
3. User authorizes
   ↓
4. Redirect back with code
   ↓
5. Exchange code for tokens
   ↓
6. Create/update user
   ↓
7. Return JWT tokens
   ↓
8. Redirect to /chat
```

## Deployment Architecture

### Frontend (Vercel)

**Platform**: Vercel Edge Network

**Features**:
- Automatic deployments from GitHub
- Edge caching for static assets
- Server-side rendering at edge locations
- Environment variable management

**Configuration**:
- `vercel.json` for deployment settings
- Environment variables in Vercel dashboard

### Backend (Railway)

**Platform**: Railway.app

**Features**:
- Automatic deployments from GitHub
- Environment variable management
- Automatic HTTPS
- Logging and monitoring

**Configuration**:
- `Procfile` for process definition
- `Dockerfile` for containerized deployment
- Environment variables in Railway dashboard

### Database (Supabase)

**Platform**: Supabase Cloud

**Features**:
- Managed PostgreSQL
- Built-in authentication
- Row Level Security
- Automatic backups
- Real-time subscriptions (optional)

**Configuration**:
- Migrations via Supabase CLI
- RLS policies for security
- Connection pooling enabled

### Vector Database (Pinecone)

**Platform**: Pinecone Serverless

**Features**:
- Serverless architecture (pay-per-use)
- Auto-scaling
- Low latency
- Managed infrastructure

**Configuration**:
- Index creation via CLI or API
- Metadata filtering enabled
- Cosine similarity metric

## Scalability Considerations

### Performance Optimizations

1. **Database**:
   - Indexes on user_id + created_at for all queries
   - Connection pooling via Supabase
   - RLS for automatic security filtering

2. **Vector Search**:
   - Pinecone serverless auto-scales
   - Limit top K results to reduce latency
   - Cache frequent queries (Phase 2)

3. **LLM**:
   - Streaming responses for better UX
   - Retry logic with exponential backoff
   - Token usage monitoring

4. **Frontend**:
   - Code splitting and lazy loading
   - CDN caching via Vercel
   - Optimistic UI updates

### Monitoring and Logging

1. **Backend**:
   - Structured logging with Pino
   - Request/response logging
   - Error tracking with stack traces

2. **Database**:
   - Supabase built-in monitoring
   - Query performance insights

3. **LLM**:
   - Token usage tracking
   - Response time monitoring
   - Error rate tracking

### Future Scaling

**Horizontal Scaling**:
- Backend: Multiple Fastify instances behind load balancer
- Database: Supabase handles automatic scaling
- Vector: Pinecone serverless auto-scales

**Caching Layer** (Phase 3):
- Redis for session caching
- Memory query result caching
- User profile caching

**Background Jobs** (Phase 2):
- Memory compression worker
- Pattern analysis worker
- Scheduled summary generation

## Security

### Authentication
- Magic link via Supabase
- JWT tokens (access + refresh)
- Secure httpOnly cookies (optional)
- Token rotation on refresh

### Authorization
- Row Level Security (RLS) in PostgreSQL
- User-scoped queries only
- Service role key for backend operations

### Data Protection
- HTTPS everywhere
- Environment variable management
- No secrets in code
- Rate limiting on all endpoints

### CORS
- Whitelist frontend origin
- Credentials allowed
- Preflight handling

## Development Workflow

### Local Development

1. Start services:
   ```bash
   docker-compose up -d  # PostgreSQL + Redis
   ```

2. Run migrations:
   ```bash
   cd apps/api && pnpm run migrate
   ```

3. Start backend:
   ```bash
   cd apps/api && pnpm dev
   ```

4. Start frontend:
   ```bash
   cd apps/web && pnpm dev
   ```

### Deployment Pipeline

```
1. Push to feature branch
   ↓
2. GitHub Actions: Lint + Type Check
   ↓
3. Create PR
   ↓
4. Review and merge to main
   ↓
5. Automatic deployments:
   - Frontend → Vercel
   - Backend → Railway
```

## Future Architecture Enhancements

### Phase 2
- Full multi-agent orchestration
- Memory compression system
- Background job processing
- Advanced pattern recognition

### Phase 3
- Redis caching layer
- Real-time collaboration features
- Mobile app (React Native)
- Voice interaction support

### Phase 4
- Self-hosted option
- Enterprise features (team workspaces)
- Advanced analytics
- Plugin system for extensibility
