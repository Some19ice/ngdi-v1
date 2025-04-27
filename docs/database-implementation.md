# Database Implementation

This document describes the database implementation for the NGDI Portal.

## Overview

The NGDI Portal uses PostgreSQL with Prisma ORM for database access. The database is hosted on Supabase, which provides a managed PostgreSQL database with additional features like authentication, storage, and real-time subscriptions.

## Database Structure

### Schema Organization

The Prisma schema is defined in `packages/db/prisma/schema.prisma`. This is the single source of truth for the database schema. All packages in the monorepo use this schema through the centralized Prisma client exported from the `@ngdi/db` package.

### Data Models

The database includes the following key models:

1. **User Model**: Stores user information, including authentication details, profile information, and role assignments.
2. **Metadata Model**: Stores geospatial metadata information following NGDI standards.
3. **Permission Models**: Implements a comprehensive permission system with roles, permissions, and permission groups.
4. **Logging Models**: Tracks security events and user activities.

### Database Access

Database access is centralized through the `@ngdi/db` package, which exports a singleton Prisma client. This ensures consistent database access across the application and prevents connection exhaustion.

## Implementation Details

### Prisma Client

The Prisma client is initialized in `packages/db/src/index.ts` and exported for use by other packages. The client is configured with connection pooling and retry mechanisms to ensure reliable database access.

### Repository Pattern

The application uses the repository pattern to abstract database access. Repositories are defined in the API package and provide methods for common database operations.

### Migrations

Database migrations are managed by Prisma Migrate. Migration files are stored in `packages/db/prisma/migrations`.

### Seed Data

Seed data is provided for development and testing purposes. The seed script is defined in `packages/db/prisma/seed.ts` and can be run with `npm run db:seed`.

## Environment Configuration

The database connection is configured through environment variables:

- `DATABASE_URL`: The connection URL for the PostgreSQL database.
- `DIRECT_URL`: The direct connection URL for the PostgreSQL database (used by Prisma Migrate).

## Supabase Integration

The application uses Supabase for database hosting and additional features. Supabase configuration is defined in environment variables:

- `SUPABASE_URL`: The URL of the Supabase project.
- `SUPABASE_ANON_KEY`: The anonymous API key for the Supabase project.

## Testing

For testing purposes, a separate test database is used. The test database configuration is defined in `packages/db/prisma/schema.test.prisma`.

## Scripts

The following scripts are available for database management:

- `npm run db:generate`: Generate Prisma client.
- `npm run db:push`: Push schema changes to the database.
- `npm run db:studio`: Open Prisma Studio for database exploration.
- `npm run db:seed`: Seed the database with initial data.
- `npm run db:reset`: Reset the database.
- `npm run db:migrate`: Create a new migration.
