# Database Migration Strategy

This document outlines the migration strategy for the NGDI Portal database.

## Overview

Database migrations are managed by Prisma Migrate. Migrations are stored in `packages/db/prisma/migrations` and are applied in order based on their timestamps.

## Migration Types

There are three types of migrations:

1. **Schema Migrations**: Changes to the database schema, such as adding or removing tables, columns, or indexes.
2. **Data Migrations**: Changes to the data in the database, such as updating values or moving data between tables.
3. **Seed Migrations**: Initial data for the database, such as default users, roles, or settings.

## Migration Process

### Creating Migrations

To create a new migration, follow these steps:

1. Update the Prisma schema in `packages/db/prisma/schema.prisma`.
2. Run `npm run db:migrate -- --name <migration-name>` to create a new migration.
3. Review the generated migration file in `packages/db/prisma/migrations`.
4. Make any necessary adjustments to the migration file.
5. Run `npm run db:push` to apply the migration to the development database.

### Naming Conventions

Migration names should be descriptive and follow the format `<action>_<entity>_<details>`. For example:

- `add_user_role_field`
- `create_metadata_table`
- `update_permission_model`
- `remove_deprecated_fields`

### Migration Guidelines

When creating migrations, follow these guidelines:

1. **Keep Migrations Small**: Each migration should make a small, focused change to the database.
2. **Make Migrations Reversible**: When possible, migrations should be reversible to allow for rollbacks.
3. **Test Migrations**: Test migrations on a development database before applying them to production.
4. **Document Migrations**: Add comments to migration files to explain complex changes.
5. **Avoid Breaking Changes**: Avoid making breaking changes to the database schema.

## Applying Migrations

### Development

In development, migrations are applied automatically when running `npm run db:push` or `npm run db:migrate`.

### Production

In production, migrations are applied using the following process:

1. Create a backup of the production database.
2. Run `npm run db:migrate:deploy` to apply pending migrations.
3. Verify that the migrations were applied successfully.
4. If there are issues, restore the database from the backup and fix the migrations.

## Rollback Strategy

If a migration needs to be rolled back, follow these steps:

1. Create a backup of the database.
2. Run `npm run db:migrate:down` to roll back the most recent migration.
3. Verify that the rollback was successful.
4. If there are issues, restore the database from the backup.

For more complex rollbacks, such as rolling back multiple migrations, use the following process:

1. Create a backup of the database.
2. Run `npm run db:migrate:status` to see the current migration status.
3. Run `npm run db:migrate:down -- --to <migration-id>` to roll back to a specific migration.
4. Verify that the rollback was successful.
5. If there are issues, restore the database from the backup.

## Migration Scripts

The following scripts are available for managing migrations:

- `npm run db:migrate`: Create a new migration.
- `npm run db:migrate:deploy`: Apply pending migrations in production.
- `npm run db:migrate:status`: Show the status of migrations.
- `npm run db:migrate:down`: Roll back the most recent migration.
- `npm run db:push`: Apply schema changes to the development database.
- `npm run db:reset`: Reset the database and apply all migrations.

## Best Practices

### Schema Changes

When making schema changes, follow these best practices:

1. **Add Before Remove**: When replacing a field, add the new field first, migrate data, then remove the old field.
2. **Use Nullable Fields**: When adding a new required field, make it nullable first, then add a default value.
3. **Use Transactions**: Wrap complex migrations in transactions to ensure atomicity.
4. **Add Indexes Separately**: Add indexes in separate migrations to avoid locking tables for too long.

### Data Migrations

When migrating data, follow these best practices:

1. **Use Batch Processing**: Process data in batches to avoid memory issues.
2. **Add Logging**: Add logging to track the progress of data migrations.
3. **Handle Errors**: Add error handling to prevent data loss.
4. **Verify Results**: Add verification steps to ensure data was migrated correctly.

## Troubleshooting

### Common Issues

1. **Migration Conflicts**: If two developers create migrations with the same name, there will be a conflict. Resolve this by renaming one of the migrations.
2. **Schema Drift**: If the database schema doesn't match the Prisma schema, use `npm run db:reset` to reset the database.
3. **Migration Failures**: If a migration fails, check the error message and fix the issue. Then try again.

### Recovery Process

If a migration fails and the database is in an inconsistent state, follow these steps:

1. Restore the database from the most recent backup.
2. Fix the migration that failed.
3. Apply the migrations again.

## Conclusion

Following this migration strategy will ensure that database changes are applied consistently and safely across all environments.
