# Auth Configuration Consolidation

This document describes the consolidation of authentication configuration files in the NGDI Portal codebase.

## Overview

Previously, the codebase had multiple auth configuration files with overlapping settings:

- `packages/web/src/lib/auth/config.ts`
- `packages/web/src/lib/auth/supabase-config.ts`
- `packages/api/src/config/supabase.config.ts`

These files have been consolidated into two main configuration files:

1. `packages/web/src/lib/auth/supabase-auth.config.ts` - Frontend auth configuration
2. `packages/api/src/config/supabase-auth.config.ts` - Backend auth configuration

## Changes Made

### 1. Created Consolidated Configuration Files

- Created a comprehensive frontend auth configuration file with well-documented settings
- Created a comprehensive backend auth configuration file with well-documented settings
- Ensured consistent naming and structure between the two files

### 2. Updated Imports and References

- Updated all imports of the old configuration files to use the new consolidated files
- Updated all references to configuration values to use the new structure
- Ensured consistent naming of imports and variables

### 3. Improved Naming Consistency

- Changed `AUTH_CONFIG` to `supabaseAuthConfig` for better clarity
- Used consistent naming conventions throughout the codebase
- Added proper TypeScript types for the configuration objects

## Usage

### Frontend Configuration

```typescript
import { supabaseAuthConfig } from "@/lib/auth/supabase-auth.config"

// Access configuration values
const signInPath = supabaseAuthConfig.pages.signIn
const protectedRoutes = supabaseAuthConfig.routes.protected
```

### Backend Configuration

```typescript
import { supabaseAuthConfig } from "../config/supabase-auth.config"

// Access configuration values
const supabaseUrl = supabaseAuthConfig.url
const cookiePrefix = supabaseAuthConfig.auth.cookies.prefix
```

## Benefits

1. **Reduced Duplication**: Eliminated redundant configuration settings
2. **Improved Maintainability**: Centralized auth configuration in dedicated files
3. **Better Documentation**: Added comprehensive comments for all configuration options
4. **Type Safety**: Added proper TypeScript types for configuration objects
5. **Consistent Naming**: Used consistent naming conventions throughout the codebase

## Cleanup

After verifying that the new configuration files work correctly, the old configuration files can be removed using the cleanup script:

```bash
./scripts/cleanup-auth-config.sh
```

This script will remove the following files:
- `packages/web/src/lib/auth/supabase-config.ts`
- `packages/web/src/lib/auth/config.ts`
- `packages/api/src/config/supabase.config.ts`
