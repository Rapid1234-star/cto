# ThinkCompanion

> A persistent personal AI cognitive companion with structured memory, multi-agent coordination, and adaptive learning.

## Overview

ThinkCompanion is not just another chatbot — it's a personal thinking partner that becomes meaningfully better the longer you work with it. It remembers your goals, learning style, skill levels, confusion patterns, and growth trajectory. Instead of stateless interactions, you get continuity and deep personalization.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **tsparticles** - Interactive particle background
- **Vercel** - Deployment platform

### Backend
- **Fastify** - High-performance Node.js framework
- **TypeScript** - Type-safe API development
- **Supabase/PostgreSQL** - Primary database with RLS
- **Pinecone** - Vector database for semantic memory
- **OpenAI** - LLM provider
- **Railway/Render** - Deployment platform

### Infrastructure
- **Supabase** - Auth + Database + RLS
- **Pinecone** - Vector embeddings storage
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting

## Project Structure

```
thinkcompanion/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Fastify backend
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── docs/                 # Comprehensive documentation
├── .github/workflows/    # CI/CD pipelines
└── docker-compose.yml    # Local development setup
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/thinkcompanion.git
   cd thinkcompanion
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Frontend
   cp apps/web/.env.example apps/web/.env.local
   
   # Backend
   cp apps/api/.env.example apps/api/.env
   ```
   
   Fill in the required API keys and configuration values.

4. **Start local development environment**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d
   
   # Run migrations
   cd apps/api
   pnpm run migrate
   
   # Start development servers
   cd ../..
   pnpm dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Development

### Running the frontend
```bash
cd apps/web
pnpm dev
```

### Running the backend
```bash
cd apps/api
pnpm dev
```

### Running both (from root)
```bash
pnpm dev
```

### Type checking
```bash
pnpm type-check
```

### Linting
```bash
pnpm lint
```

### Building for production
```bash
pnpm build
```

## Database Migrations

ThinkCompanion uses SQL migrations for database schema management.

### Running migrations
```bash
cd apps/api
pnpm run migrate
```

### Creating a new migration
```bash
cd apps/api/migrations
# Create new file: XXX_description.sql
```

See `apps/api/migrations/README.md` for detailed migration documentation.

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and architecture
- **[API.md](docs/API.md)** - API endpoint documentation
- **[AGENTS.md](docs/AGENTS.md)** - Multi-agent system design
- **[MEMORY.md](docs/MEMORY.md)** - Memory architecture
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment guide
- **[DATABASE.md](docs/DATABASE.md)** - Database schema documentation

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Configure environment variables
3. Deploy automatically on push to `main`

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Contributing

This project follows a monorepo structure using pnpm workspaces.

### Adding a new package
```bash
mkdir packages/new-package
cd packages/new-package
pnpm init
```

### Shared types
All shared types between frontend and backend should be added to `packages/shared-types`.

## License

MIT

## Support

For questions or issues, please open a GitHub issue.
