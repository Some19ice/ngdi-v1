# Seed Data Strategy

This document outlines the seed data strategy for the NGDI Portal database.

## Overview

Seed data is used to populate the database with initial data for development, testing, and production environments. The NGDI Portal uses different seed data for each environment to ensure that each environment has the appropriate data for its purpose.

## Seed Scripts

The NGDI Portal includes the following seed scripts:

1. **Base Seed Script**: `packages/db/prisma/seed.ts`
   - Creates essential data required for the application to function
   - Creates default roles, permissions, and permission groups
   - Creates a default admin user if one doesn't exist
   - Should be run in all environments (development, testing, production)

2. **Development Seed Script**: `packages/db/prisma/seed-dev.ts`
   - Creates sample data for development purposes
   - Creates sample users with different roles
   - Creates sample metadata entries
   - Creates sample settings
   - Should only be run in development environments

3. **Test Seed Script**: `packages/db/prisma/seed-test.ts`
   - Creates minimal data for testing purposes
   - Creates test users with different roles
   - Creates test metadata entries
   - Creates test settings
   - Should only be run in test environments

## Running Seed Scripts

To run the seed scripts, use the following commands:

```bash
# Run base seed script (all environments)
npm run db:seed

# Run development seed script (development only)
npm run db:seed:dev

# Run test seed script (testing only)
npm run db:seed:test
```

## Seed Data Structure

### Base Seed Data

The base seed script creates the following data:

1. **Permissions**:
   - Metadata permissions (create, read, update, delete, approve, publish, import, export)
   - User permissions (create, read, update, delete, manage-roles)
   - Role permissions (create, read, update, delete, assign)
   - Permission permissions (create, read, update, delete, assign)
   - System permissions (settings, logs, backup)
   - Dashboard permissions (view, analytics, reports)
   - Organization permissions (create, read, update, delete, manage-members)

2. **Permission Groups**:
   - Metadata Management
   - User Management
   - Role Management
   - Permission Management
   - System Administration
   - Dashboard Access
   - Organization Management

3. **Roles**:
   - Admin: System administrator with full access
   - Node Officer: Node officer with specific privileges
   - User: Regular user with basic access
   - Guest: Guest user with limited access
   - Content Manager: User who can manage metadata content
   - Analyst: User who can analyze data

4. **Admin User**:
   - Email: admin@example.com
   - Password: Admin123!
   - Role: Admin

### Development Seed Data

The development seed script creates the following data:

1. **Users**:
   - Admin User: admin@example.com
   - Node Officer: nodeofficer@example.com
   - Regular User: user@example.com
   - Content Manager: contentmanager@example.com
   - Data Analyst: analyst@example.com
   - Unverified User: unverified@example.com
   - Locked User: locked@example.com

2. **Metadata**:
   - Nigeria Administrative Boundaries
   - Nigeria Land Cover 2023
   - Lagos State Road Network
   - Nigeria Population Density 2023

3. **Settings**:
   - Site Name: NGDI Portal
   - Site Description: Nigeria Geospatial Data Infrastructure Portal
   - Support Email: support@ngdi.gov.ng
   - Max Upload Size: 100 MB
   - Default Language: en
   - Maintenance Mode: false
   - Enable Registration: true
   - Require Email Verification: true
   - Metadata Validation: true
   - Auto Backup: true
   - Backup Frequency: daily
   - Storage Provider: local
   - API Rate Limit: 100

### Test Seed Data

The test seed script creates the following data:

1. **Users**:
   - Test Admin: test-admin@example.com
   - Test User: test-user@example.com

2. **Metadata**:
   - Test Metadata 1
   - Test Metadata 2

3. **Settings**:
   - Site Name: Test Portal
   - Site Description: Test Portal Description
   - Support Email: test@example.com
   - Max Upload Size: 10 MB
   - Default Language: en
   - Maintenance Mode: false
   - Enable Registration: true
   - Require Email Verification: false
   - Metadata Validation: false
   - Auto Backup: false
   - Backup Frequency: never
   - Storage Provider: local
   - API Rate Limit: 1000

## Best Practices

When working with seed data, follow these best practices:

1. **Keep Seed Data Minimal**: Only include the data necessary for the environment.
2. **Use Descriptive Names**: Use descriptive names for seed data to make it easy to identify.
3. **Use Realistic Data**: Use realistic data that reflects the expected data in the environment.
4. **Use Consistent Data**: Use consistent data across environments to make it easier to test.
5. **Use Idempotent Scripts**: Make seed scripts idempotent so they can be run multiple times without creating duplicate data.
6. **Document Seed Data**: Document the seed data structure to make it easier to understand.

## Conclusion

Following this seed data strategy will ensure that each environment has the appropriate data for its purpose, making development, testing, and production environments more consistent and reliable.
