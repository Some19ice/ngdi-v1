# NGDI Portal Monorepo

A modern web application for the National Geospatial Data Infrastructure (NGDI), built with Next.js 14, TypeScript, and Hono.js, organized as a monorepo using Turborepo.

## Project Overview

The NGDI Portal serves as a centralized platform for managing and accessing geospatial data in Nigeria. It features user authentication, metadata management, map visualization, and search capabilities.

## Project Structure

```
├── docs/                  # Project documentation
├── packages/              # Monorepo packages
│   ├── api/               # Hono API server
│   │   ├── src/           # API source code
│   │   └── tests/         # API tests
│   ├── db/                # Database package
│   │   ├── prisma/        # Prisma schema (single source of truth)
│   │   └── src/           # Database client exports
│   ├── types/             # Shared TypeScript types
│   │   └── src/           # Type definitions
│   ├── ui/                # Shared UI components
│   │   ├── src/           # UI component source code
│   │   └── stories/       # Storybook stories
│   ├── utils/             # Shared utilities
│   │   ├── src/           # Utility functions
│   │   └── tests/         # Utility tests
│   ├── test-utils/        # Testing utilities
│   │   └── src/           # Test helpers and mocks
│   └── web/               # Next.js frontend
│       ├── src/           # Frontend source code
│       │   ├── app/       # Next.js App Router pages and layouts
│       │   ├── components/# React components
│       │   └── lib/       # Frontend-specific utilities
│       └── public/        # Static assets
├── scripts/               # Build and utility scripts
└── tests/                 # E2E tests
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```
   This will start both the Next.js frontend and Hono API server using Turborepo.

## Available Scripts

### Main Commands
- `npm run dev` - Start all packages in development mode
- `npm run build` - Build all packages for production
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run clean` - Clean all packages

### Database
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database
- `npm run db:reset` - Reset the database
- `npm run db:migrate` - Create a new migration

### Package-specific Commands
You can run commands for specific packages using the workspace flag:
```bash
npm run dev -w packages/web
npm run test -w packages/api
```

## Environment Variables

- Frontend: See `.env.example` for required variables
- API: See `packages/api/.env.example` for required variables

## Features

- **Authentication**: User registration, login, and profile management
- **Metadata Management**: Create, edit, and manage geospatial metadata
- **Map Viewer**: Visualize geospatial data using Leaflet/OpenLayers
- **Search**: Advanced search functionality for finding metadata
- **User Management**: Role-based access control

## Monorepo Architecture

The project is organized as a monorepo using Turborepo with the following packages:

- **@ngdi/web**: Next.js frontend application
- **@ngdi/api**: Hono.js backend API
- **@ngdi/db**: Database package with Prisma schema
- **@ngdi/ui**: Shared UI components
- **@ngdi/types**: Shared TypeScript types
- **@ngdi/utils**: Shared utility functions
- **@ngdi/test-utils**: Testing utilities and mocks

This architecture provides several benefits:
- **Code Reuse**: Shared code is properly isolated in dedicated packages
- **Consistency**: Single source of truth for database schema, types, and utilities
- **Developer Experience**: Improved build times with Turborepo caching
- **Maintainability**: Clear separation of concerns with well-defined package boundaries

## Testing

We use Vitest for testing across the monorepo:
- **@ngdi/web**: Component and integration tests
- **@ngdi/api**: API endpoint and service tests
- **@ngdi/utils**: Unit tests for utility functions
- **@ngdi/test-utils**: Shared testing utilities and mocks

The test-utils package provides:
- Custom render functions with providers
- Mock data generators
- Common test utilities and mocks

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
3. Run tests for all affected packages
4. Submit a pull request

## License

This project is proprietary and confidential.

