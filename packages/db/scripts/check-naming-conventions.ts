#!/usr/bin/env tsx

/**
 * Script to check for naming convention violations in the Prisma schema
 */

import fs from 'fs';
import path from 'path';
import { parse } from '@prisma/sdk';

const SCHEMA_PATH = path.resolve(__dirname, '../prisma/schema.prisma');

// Naming convention rules
const RULES = {
  model: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    message: 'Model names should use PascalCase (e.g., User, Metadata)',
  },
  enum: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    message: 'Enum names should use PascalCase (e.g., UserRole)',
  },
  enumValue: {
    pattern: /^[A-Z][A-Z0-9_]*$/,
    message: 'Enum values should use UPPER_SNAKE_CASE (e.g., USER, NODE_OFFICER)',
  },
  field: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    message: 'Field names should use camelCase (e.g., firstName, createdAt)',
  },
  index: {
    pattern: /^idx_[A-Z][a-zA-Z0-9]*_[a-z][a-zA-Z0-9_]*$/,
    message: 'Index names should follow the pattern idx_Table_column (e.g., idx_User_email)',
  },
  uniqueConstraint: {
    pattern: /^uq_[A-Z][a-zA-Z0-9]*_[a-z][a-zA-Z0-9_]*$/,
    message: 'Unique constraint names should follow the pattern uq_Table_column (e.g., uq_User_email)',
  },
  primaryKey: {
    pattern: /^pk_[A-Z][a-zA-Z0-9]*$/,
    message: 'Primary key constraint names should follow the pattern pk_Table (e.g., pk_User)',
  },
  foreignKey: {
    pattern: /^fk_[A-Z][a-zA-Z0-9]*_[a-z][a-zA-Z0-9_]*$/,
    message: 'Foreign key constraint names should follow the pattern fk_Table_column (e.g., fk_Metadata_userId)',
  },
};

// Read the schema file
const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Parse the schema
const schema = parse(schemaContent);

// Check for naming convention violations
const violations: string[] = [];

// Check model names
schema.models.forEach((model) => {
  if (!RULES.model.pattern.test(model.name)) {
    violations.push(`Model ${model.name}: ${RULES.model.message}`);
  }

  // Check field names
  model.fields.forEach((field) => {
    if (!RULES.field.pattern.test(field.name)) {
      violations.push(`Field ${model.name}.${field.name}: ${RULES.field.message}`);
    }
  });
});

// Check enum names
schema.enums.forEach((enumDef) => {
  if (!RULES.enum.pattern.test(enumDef.name)) {
    violations.push(`Enum ${enumDef.name}: ${RULES.enum.message}`);
  }

  // Check enum values
  enumDef.values.forEach((value) => {
    if (!RULES.enumValue.pattern.test(value.name)) {
      violations.push(`Enum value ${enumDef.name}.${value.name}: ${RULES.enumValue.message}`);
    }
  });
});

// Report violations
if (violations.length > 0) {
  console.error('Naming convention violations found:');
  violations.forEach((violation) => {
    console.error(`- ${violation}`);
  });
  process.exit(1);
} else {
  console.log('No naming convention violations found.');
  process.exit(0);
}
