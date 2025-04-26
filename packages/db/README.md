# @ngdi/db

This package contains the database schema and client for the NGDI Portal.

## Usage

```typescript
import { prisma } from '@ngdi/db';

// Use the Prisma client
const users = await prisma.user.findMany();
```

## Scripts

- `npm run build` - Build the package
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to the database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database
- `npm run db:reset` - Reset the database
- `npm run db:migrate` - Create a new migration
