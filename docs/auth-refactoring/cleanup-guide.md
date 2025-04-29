# Authentication System Cleanup Guide

This guide provides instructions for cleaning up the legacy authentication code in the NGDI Portal codebase after migrating to the new Supabase Auth implementation.

## Overview

The NGDI Portal has been refactored to use Supabase Auth exclusively for authentication. As part of this refactoring, we've created a new unified authentication hook (`useAuthSession`) that replaces all the previous authentication hooks and utilities.

This cleanup process will:

1. Mark deprecated files with comments
2. Create a list of files that can be safely removed
3. Provide scripts to remove legacy files and unused dependencies

## Prerequisites

Before starting the cleanup process, ensure that:

1. All components have been updated to use the new `useAuthSession` hook
2. All protected routes have been updated to use the new role guards
3. All tests pass with the new authentication system
4. The application has been thoroughly tested in development

## Cleanup Process

### 1. Run the Cleanup Script

The cleanup script will mark deprecated files with comments and create scripts for removing legacy files and dependencies:

```bash
# Make the script executable
chmod +x scripts/cleanup-auth.sh

# Run the script
./scripts/cleanup-auth.sh
```

This will:
- Add `@deprecated` comments to files that should be deprecated but not immediately removed
- Create a list of files that can be safely removed (`cleanup-files.txt`)
- Create scripts for removing legacy files (`remove-legacy-auth.sh`) and dependencies (`remove-legacy-deps.sh`)

### 2. Review the List of Files to Remove

Review the list of files in `cleanup-files.txt` to ensure that no files are being removed that are still needed:

```bash
cat cleanup-files.txt
```

### 3. Remove Legacy Files

After reviewing the list, run the removal script to delete the legacy files:

```bash
./remove-legacy-auth.sh
```

### 4. Remove Unused Dependencies

Remove unused dependencies related to the legacy authentication system:

```bash
./remove-legacy-deps.sh
```

### 5. Test the Application

After removing the legacy files and dependencies, thoroughly test the application to ensure that everything still works correctly:

```bash
# Run tests
npm test

# Start the development server
npm run dev
```

## Files Marked as Deprecated

The following files have been marked as deprecated but not removed:

1. `packages/web/src/hooks/use-session.ts` - Wrapper around `useAuthSession` for backward compatibility
2. `packages/web/src/hooks/use-supabase-auth.ts` - Older version of the Supabase auth hook
3. `packages/web/src/lib/supabase-auth-context.tsx` - Auth context that now uses `useAuthSession` internally

These files are maintained for backward compatibility and will be removed in a future version.

## Files Removed

The following files have been removed:

### Web Package

- `packages/web/src/lib/auth.ts`
- `packages/web/src/lib/auth-client.ts`
- `packages/web/src/lib/auth/auth-config.ts`
- `packages/web/src/lib/auth/auth-types.ts`
- `packages/web/src/lib/auth/server-auth.ts`
- `packages/web/src/lib/auth-refresh.ts`
- `packages/web/src/hooks/use-auth.ts`
- `packages/web/src/hooks/use-auth-with-cache.ts`
- `packages/web/src/lib/services/auth.service.ts`
- `packages/web/src/lib/auth/validation.ts`
- `packages/web/src/lib/auth/token-service.ts`
- `packages/web/src/lib/token-security.ts`
- `packages/web/src/app/api/auth/sync-tokens/route.ts`
- `packages/web/src/lib/auth/paths.ts`

### API Package

- `packages/api/src/middleware/auth.middleware.ts`
- `packages/api/src/routes/auth.routes.ts`
- `packages/api/src/services/auth.service.ts`
- `packages/api/src/services/token-validation.service.ts`
- `packages/api/src/utils/jwt.ts`
- `packages/api/src/services/account-lockout.service.ts`
- `packages/api/src/services/password-policy.service.simplified.ts`

## Dependencies Removed

The following dependencies have been removed:

### Web Package

- `jsonwebtoken`
- `bcryptjs`
- `jose`
- `axios`

### API Package

- `jsonwebtoken`
- `bcryptjs`
- `jose`

## Troubleshooting

If you encounter issues after the cleanup:

1. Check if any components are still using the removed files
2. Check if any imports reference the removed files
3. Check if any dependencies are still needed by other parts of the application

## Next Steps

After completing the cleanup process:

1. Update the documentation to reflect the new authentication system
2. Remove any references to the legacy authentication system in the documentation
3. Update the onboarding documentation for new developers
