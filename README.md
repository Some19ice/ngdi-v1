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

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   cd packages/api && cp .env.example .env
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```
   This will start both the Next.js frontend and Hono API server.

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


