# Metadata Model Standardization Guide

This document outlines the process for standardizing the metadata models in the NGDI application by consolidating the `NGDIMetadata` and `Metadata` models into a single enhanced `Metadata` model.

## Background

The application previously used two separate models for storing metadata:

1. **Metadata** - A simpler, general-purpose metadata model with basic geospatial attributes.
2. **NGDIMetadata** - A more comprehensive model following the Nigeria Geospatial Data Infrastructure standards.

This duplication created maintenance challenges and inconsistencies in how metadata was stored and accessed.

## Standardization Process

The standardization involves the following steps:

### 1. Schema Updates (Completed)

- Enhanced the `Metadata` model to include all fields from `NGDIMetadata`
- Made legacy fields optional with appropriate comments
- Marked the `NGDIMetadata` model as deprecated (to be removed after migration)
- Temporarily maintained the relation between `User` and `NGDIMetadata` for migration purposes

### 2. Data Migration

Run the migration script to transfer data from `NGDIMetadata` to the enhanced `Metadata` model:

```bash
npm run migrate:ngdi-to-metadata
```

This script:
- Transfers all records from `NGDIMetadata` to `Metadata`
- Maintains all relations (especially user ownership)
- Performs field mapping to ensure data integrity
- Avoids duplicate entries

### 3. Code Updates (To Be Completed)

After successful data migration, update all application code to use only the `Metadata` model:

1. Search for all references to `NGDIMetadata`, `nGDIMetadata`, or similar patterns
2. Update imports to use the consolidated `Metadata` model
3. Update API endpoints, actions, and components that currently use `NGDIMetadata`
4. Update form validation schemas to use the enhanced `Metadata` structure

### 4. Schema Cleanup (Final Step)

After all code has been updated and tested:

1. Remove the `NGDIMetadata` model from the Prisma schema
2. Remove the `ngdiMetadata` relation from the `User` model
3. Generate a new Prisma client
4. Run database migrations to apply the schema changes

## Guidelines for Developers

When updating code:

1. Use `title` and `dataName` interchangeably during the transition period
2. Prefer using the NGDI-specific field names going forward
3. Update form validation schemas to validate the new fields
4. Use the legacy fields only when needed for backward compatibility

## Future Considerations

- Consider adding database migrations to rename fields for better consistency
- Update documentation to reflect the consolidated model
- Consider updating UI components to display the additional metadata fields

## References

- [Original Schema Files](../prisma/schema.prisma)
- [Migration Script](../packages/api/src/scripts/migrate-ngdi-to-metadata.ts) 