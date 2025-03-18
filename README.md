# NGDI Portal

A modern web application built with Next.js 14, TypeScript, and Hono.

## Project Structure

```
├── app/                    # Next.js App Router pages and layouts
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── error/            # Error handling components
│   ├── layout/           # Layout components
│   ├── map/             # Map-related components
│   ├── metadata/        # Metadata components
│   ├── providers/       # React context providers
│   └── ui/              # Reusable UI components
├── docs/                 # Project documentation
├── hooks/                # Custom React hooks
├── lib/                  # Shared utilities and helpers
├── packages/             # Monorepo packages
│   └── api/             # Hono API server
│       ├── src/         # API source code
│       ├── tests/       # API tests
│       └── docker/      # Docker configuration
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Build and utility scripts
├── tests/                # Frontend E2E tests
└── types/                # TypeScript type definitions
```

## Environment Setup

### Frontend (.env.local in project root)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="3EmsMe5QHrzZ9dTlmEXSofSk3PB9XwsGEEtJkwylsqqncAxn6W2MAtaVJsw="
NEXT_PUBLIC_API_URL=http://localhost:3001
SERVER_API_KEY="admin-api-secret-token-for-server-requests"
```

### API Server (.env.local in packages/api)
```
# API Server Configuration
PORT=3001
HOST=localhost

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ngdi_db"

# JWT Configuration
JWT_SECRET="3EmsMe5QHrzZ9dTlmEXSofSk3PB9XwsGEEtJkwylsqqncAxn6W2MAtaVJsw="
JWT_EXPIRES_IN=86400  # 24 hours

# CORS Configuration
CORS_ORIGINS="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=100

# Server-to-server authentication
SERVER_API_KEY="admin-api-secret-token-for-server-requests"
```

## Development

### Starting the development server
```bash
npm run dev
```

This will start both the Next.js frontend and the API server.

## Authentication

The system uses two authentication methods:
1. JWT tokens for user authentication
2. SERVER_API_KEY for server-to-server API calls

Make sure the SERVER_API_KEY matches in both .env files.

## Available Scripts

### Main Commands
- `npm run dev` - Start both frontend and API development servers
- `npm run build` - Build both frontend and API for production
- `npm run start` - Start both frontend and API production servers
- `npm run test` - Run all tests (frontend and API)

### Frontend Specific
- `npm run dev:web` - Start frontend development server
- `npm run build:web` - Build frontend for production
- `npm run start:web` - Start frontend production server
- `npm run test:web` - Run frontend tests
- `npm run test:ui` - Run frontend tests with UI
- `npm run test:coverage` - Generate frontend test coverage report

### API Specific
- `npm run dev:api` - Start API development server
- `npm run build:api` - Build API for production
- `npm run start:api` - Start API production server
- `npm run test:api` - Run API tests

### Database
- `npm run db:push` - Push database schema changes
- `npm run db:init` - Initialize database

## Environment Variables

- Frontend: See `.env.example` for required variables
- API: See `packages/api/.env.example` for required variables

## Testing

We use different testing frameworks for frontend and API:
- Frontend: Playwright for end-to-end testing
- API: Jest for unit and integration testing

Run all tests:
```bash
npm run test
```

## Docker Support

The API server includes Docker support for easy deployment:

```bash
cd packages/api
docker-compose up
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests for both frontend and API
4. Submit a pull request

## License

[Add your license here]


