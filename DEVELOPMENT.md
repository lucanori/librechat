# One Ring Development Setup

This guide helps you set up One Ring for local development with live UI updates.

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Git

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.dev.example .env
   # Edit .env with your API keys and replace YOUR_SERVER_IP with your actual server IP
   ```

3. **Start development environment:**
   ```bash
   npm run dev:full
   ```

This will:
- Start all required services (MongoDB, Meilisearch, VectorDB, RAG API) in Docker
- Build the shared packages
- Start the backend API server with hot reload
- Start the frontend development server with hot reload

The application will be available at:
- **Frontend (UI):** http://YOUR_SERVER_IP:3090
- **Backend (API):** http://YOUR_SERVER_IP:3080

Replace `YOUR_SERVER_IP` with your actual server IP address.

## Development Commands

### Main Commands

- `npm run dev:full` - Start everything (services + app)
- `npm run dev` - Start only the app (requires services to be running)
- `npm run dev:services` - Start only the backend services
- `npm run dev:stop` - Stop all services

### Individual Components

- `npm run backend:dev` - Start backend only (with hot reload)
- `npm run frontend:dev` - Start frontend only (with hot reload)
- `npm run build:packages` - Build shared packages

### Utilities

- `npm run create-user` - Create a new user
- `npm run list-users` - List all users
- `npm run add-balance` - Add balance to a user

## Development Workflow

1. **Make UI changes:** Edit files in `client/src/` - changes will hot reload
2. **Make API changes:** Edit files in `api/` - server will restart automatically
3. **Make shared package changes:** Run `npm run build:packages` then restart dev servers

## Project Structure

```
├── api/                 # Backend Node.js application
├── client/              # Frontend React application
├── packages/            # Shared packages
│   ├── data-provider/   # Data layer abstraction
│   ├── data-schemas/    # Shared data schemas
│   └── mcp/            # Model Context Protocol client
├── config/             # Configuration scripts
└── docker-compose.dev.yml  # Development services
```

## Environment Configuration

The `.env` file controls the application behavior. Key settings for development:

```bash
# Server (0.0.0.0 allows remote access)
HOST=0.0.0.0
PORT=3080

# Database
MONGO_URI=mongodb://127.0.0.1:27017/OneRing

# Frontend URL (replace with your server IP)
DOMAIN_CLIENT=http://YOUR_SERVER_IP:3090

# Backend URL (replace with your server IP)
DOMAIN_SERVER=http://YOUR_SERVER_IP:3080

# Debug logging
DEBUG_LOGGING=true
DEBUG_CONSOLE=true
```

**Important for Remote Development:**
Replace `YOUR_SERVER_IP` in the `.env` file with your actual server's IP address to enable remote access.

## Troubleshooting

### Port conflicts
- Frontend: 3090 (configurable in `client/vite.config.ts`)
- Backend: 3080 (configurable in `.env`)
- MongoDB: 27017
- Meilisearch: 7700
- RAG API: 8000

**Note:** All services bind to `0.0.0.0` for remote access. Make sure these ports are open in your firewall if accessing from remote machines.

### Services not starting
```bash
# Check if ports are in use
npm run dev:stop
docker compose -f docker-compose.dev.yml down -v

# Restart services
npm run dev:services
```

### Package build issues
```bash
# Clean and rebuild packages
rm -rf packages/*/dist
npm run build:packages
```

### Database issues
```bash
# Reset MongoDB data
npm run dev:stop
rm -rf data-node/
npm run dev:services
```

## Production Build

To build for production:

```bash
npm run frontend  # Builds frontend for production
npm run backend   # Runs backend in production mode
```

## Testing

```bash
npm run test:client  # Frontend tests
npm run test:api     # Backend tests
npm run e2e         # End-to-end tests
```

## Code Quality

```bash
npm run lint        # Check linting
npm run lint:fix    # Fix linting issues
npm run format      # Format code with Prettier