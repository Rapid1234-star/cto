# ThinkCompanion API

Backend API for ThinkCompanion platform.

## Tech Stack

- **Fastify** - High-performance web framework
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database with RLS
- **Pinecone** - Vector database for semantic search
- **OpenAI** - LLM provider

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (or Supabase account)
- Pinecone account
- OpenAI API key

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Fill in the environment variables in `.env`

4. Run database migrations:
   ```bash
   pnpm run migrate
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:5000`

## Project Structure

```
src/
├── config/          # Configuration files
├── routes/          # API route handlers
├── services/        # Business logic
├── middleware/      # Fastify middleware
├── utils/           # Utility functions
└── server.ts        # Main server file
```

## API Endpoints

### Auth
- `POST /auth/magic-link` - Send magic link
- `POST /auth/verify` - Verify magic link token
- `POST /auth/logout` - Sign out
- `GET /auth/me` - Get current user

### Chat
- `POST /chat` - Send chat message (supports streaming)
- `GET /chat/sessions` - Get chat sessions
- `GET /chat/sessions/:id` - Get session messages
- `POST /chat/sessions/:id/end` - End session

### User
- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update profile
- `GET /user/goals` - Get goals
- `POST /user/goals` - Create goal
- `PATCH /user/goals/:id` - Update goal
- `GET /user/skills` - Get skill levels
- `PUT /user/skills/:topic` - Update skill level

### Memory
- `POST /memory/query` - Search memories
- `GET /memory/recent` - Get recent activity
- `GET /memory/summaries` - Get memory summaries

## Deployment

### Railway

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to `main`

### Docker

Build and run with Docker:

```bash
docker build -t thinkcompanion-api .
docker run -p 5000:5000 --env-file .env thinkcompanion-api
```

## Testing

```bash
# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
