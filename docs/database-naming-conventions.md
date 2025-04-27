# Database Naming Conventions

This document outlines the naming conventions for the NGDI Portal database.

## Overview

Consistent naming conventions are essential for maintaining a clean and understandable database schema. These conventions apply to all database objects, including tables, columns, indexes, constraints, and migrations.

## General Principles

1. **Clarity**: Names should clearly indicate the purpose of the object.
2. **Consistency**: Similar objects should follow the same naming pattern.
3. **Brevity**: Names should be concise while still being descriptive.
4. **Singularity**: Table names should be singular (e.g., `User` not `Users`).
5. **Camel Case**: Use camel case for all names (e.g., `firstName` not `first_name`).
6. **Avoid Abbreviations**: Use full words unless the abbreviation is widely understood.
7. **Avoid Reserved Words**: Avoid using SQL reserved words as names.

## Table Names

1. **PascalCase**: Table names should use PascalCase (e.g., `User`, `Metadata`).
2. **Singular Form**: Table names should be in singular form (e.g., `User` not `Users`).
3. **Descriptive**: Table names should describe the entity they represent.
4. **Domain Prefixes**: Consider using domain prefixes for related tables (e.g., `AuthUser`, `AuthSession`).

## Column Names

1. **camelCase**: Column names should use camelCase (e.g., `firstName`, `createdAt`).
2. **Descriptive**: Column names should describe the data they contain.
3. **Consistent Suffixes**: Use consistent suffixes for similar columns:
   - `Id`: Primary key or foreign key (e.g., `userId`)
   - `Name`: Name of an entity (e.g., `firstName`)
   - `Date`: Date value (e.g., `createdDate`)
   - `At`: Timestamp (e.g., `createdAt`)
   - `Count`: Count of items (e.g., `loginCount`)
   - `Is`: Boolean flag (e.g., `isActive`)
   - `Has`: Boolean flag indicating possession (e.g., `hasAccess`)
4. **Foreign Keys**: Foreign key columns should be named after the referenced table and column (e.g., `userId` for a foreign key to the `id` column of the `User` table).
5. **Avoid Table Name**: Avoid including the table name in column names unless it's a foreign key (e.g., use `name` not `userName` in the `User` table).

## Index Names

1. **Descriptive Prefix**: Index names should start with `idx_` to indicate they are indexes.
2. **Table Name**: Include the table name in the index name.
3. **Columns**: Include the indexed columns in the index name.
4. **Example**: `idx_User_email` for an index on the `email` column of the `User` table.

## Constraint Names

1. **Descriptive Prefix**: Constraint names should start with a prefix indicating the type of constraint:
   - `pk_`: Primary key constraint
   - `fk_`: Foreign key constraint
   - `uq_`: Unique constraint
   - `ck_`: Check constraint
2. **Table Name**: Include the table name in the constraint name.
3. **Columns**: Include the constrained columns in the constraint name.
4. **Example**: `pk_User_id` for a primary key constraint on the `id` column of the `User` table.

## Enum Names

1. **PascalCase**: Enum names should use PascalCase (e.g., `UserRole`).
2. **Singular Form**: Enum names should be in singular form.
3. **Descriptive**: Enum names should describe the type of values they contain.
4. **Values**: Enum values should be in UPPER_SNAKE_CASE (e.g., `ADMIN`, `NODE_OFFICER`).

## Migration Names

1. **Timestamp Prefix**: Migration names should start with a timestamp in the format `YYYYMMDDHHMMSS`.
2. **Action**: Include the action being performed in the migration name (e.g., `add`, `create`, `update`, `remove`).
3. **Entity**: Include the entity being modified in the migration name.
4. **Details**: Include additional details if necessary.
5. **Example**: `20240401000000_optimize_metadata_model` for a migration that optimizes the Metadata model.

## JSON Field Keys

1. **camelCase**: JSON field keys should use camelCase (e.g., `firstName`, `addressLine1`).
2. **Consistent**: JSON field keys should follow the same naming conventions as column names.
3. **Descriptive**: JSON field keys should describe the data they contain.

## Examples

### Table Names

- `User`: Stores user information
- `Metadata`: Stores metadata information
- `VerificationToken`: Stores verification tokens
- `SecurityLog`: Stores security logs

### Column Names

- `id`: Primary key
- `userId`: Foreign key to the User table
- `firstName`: First name of a user
- `createdAt`: Timestamp when the record was created
- `isActive`: Boolean flag indicating if a user is active
- `loginCount`: Count of user logins

### Index Names

- `idx_User_email`: Index on the email column of the User table
- `idx_Metadata_title`: Index on the title column of the Metadata table
- `idx_SecurityLog_createdAt`: Index on the createdAt column of the SecurityLog table

### Constraint Names

- `pk_User_id`: Primary key constraint on the id column of the User table
- `fk_Metadata_userId`: Foreign key constraint on the userId column of the Metadata table
- `uq_User_email`: Unique constraint on the email column of the User table

### Enum Names

- `UserRole`: Enum for user roles
  - `ADMIN`: Administrator role
  - `NODE_OFFICER`: Node officer role
  - `USER`: Regular user role

### Migration Names

- `20240401000000_optimize_metadata_model`: Migration that optimizes the Metadata model
- `20240401000001_add_user_locked_field`: Migration that adds a locked field to the User model
- `20240401000002_create_security_log_table`: Migration that creates the SecurityLog table

## Implementation

To implement these naming conventions, follow these steps:

1. **Review Existing Schema**: Review the existing database schema to identify inconsistencies.
2. **Create Migration Plan**: Create a plan for migrating to the new naming conventions.
3. **Update Schema**: Update the Prisma schema to follow the new naming conventions.
4. **Create Migrations**: Create migrations to update the database schema.
5. **Update Code**: Update the application code to use the new names.
6. **Document Changes**: Document the changes to help developers understand the new conventions.

## Linting Rules

To enforce these naming conventions, consider using the following linting rules:

1. **Prisma Schema Linting**: Use the Prisma schema linting tool to enforce naming conventions.
2. **Custom ESLint Rules**: Create custom ESLint rules to enforce naming conventions in the application code.
3. **Pre-commit Hooks**: Use pre-commit hooks to check for naming convention violations.

## Conclusion

Following these naming conventions will ensure a consistent and understandable database schema, making it easier for developers to work with the database.
