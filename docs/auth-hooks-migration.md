# Authentication Hooks Migration Guide

## Overview

The NGDI Portal is standardizing on a single unified authentication hook: `useAuthSession`. This guide will help you migrate from the deprecated hooks to the new unified approach.

## Why Migrate?

- **Simplified API**: One hook for all authentication needs
- **Improved Performance**: Built on React Query for efficient caching and synchronization
- **Consistent Access Patterns**: Standard method for accessing auth state across the application
- **Type Safety**: Stronger TypeScript typing
- **Better Maintainability**: Centralized auth logic

## Migration Steps

### 1. Replace Imports

Replace imports for deprecated hooks with the unified hook:

```diff
- import { useAuth } from "@/lib/auth-context";
- import { useSession } from "@/lib/auth-context";
- import { useIsAuthenticated } from "@/lib/auth-context";
- import { useIsAdmin } from "@/lib/auth-context";
- import { useIsNodeOfficer } from "@/lib/auth-context";
- import { useUser } from "@/lib/auth-context";
+ import { useAuthSession } from "@/hooks/use-auth-session";
```

### 2. Update Hook Usage

Replace uses of deprecated hooks with the unified hook:

#### useAuth → useAuthSession

```diff
- const {
-   session,
-   status,
-   user,
-   login,
-   logout,
-   refreshSession
- } = useAuth();
+ const {
+   session,
+   status,
+   user,
+   login,
+   logout,
+   refreshSession,
+   isAuthenticated,
+   hasRole,
+   isAdmin
+ } = useAuthSession();
```

#### useSession → useAuthSession

```diff
- const { data: session, status } = useSession();
+ const { session, status } = useAuthSession();
```

#### useUser → useAuthSession

```diff
- const { user, isLoading } = useUser();
+ const { user, isLoading } = useAuthSession();
```

#### useIsAuthenticated → useAuthSession

```diff
- const isAuthenticated = useIsAuthenticated();
+ const { isAuthenticated } = useAuthSession();
```

#### useIsAdmin → useAuthSession

```diff
- const isAdmin = useIsAdmin();
+ const { isAdmin } = useAuthSession();
```

#### useIsNodeOfficer → useAuthSession

```diff
- const isNodeOfficer = useIsNodeOfficer();
+ const { isNodeOfficer } = useAuthSession();
```

### 3. Special Cases

#### Method Aliases

The `useAuthSession` hook provides consistent method names. Some methods have been renamed:

```diff
- const { signOut } = useAuth();
+ const { logout } = useAuthSession();

- const { signIn } = useAuth();
+ const { login } = useAuthSession();
```

#### Async vs Sync Methods

The hook provides both async and sync versions of methods:

```javascript
// Async methods (recommended)
const { login, logout, register } = useAuthSession();

// Sync methods (for compatibility)
const { loginSync, logoutSync, registerSync } = useAuthSession();
```

Use async methods when you need to handle the result directly, and sync methods when you just want to trigger the action without waiting for the result.

## Complete Reference

Here's a complete reference of properties and methods available in `useAuthSession`:

```typescript
const {
  // State
  session,                // The current session object (or null)
  user,                   // The current user (or null)
  status,                 // Status: "loading", "authenticated", "unauthenticated"
  isLoading,              // True if auth state is loading
  isAuthenticated,        // True if user is authenticated
  isError,                // True if there was an error loading the session
  error,                  // Error object if there was an error

  // Role helpers
  isAdmin,                // True if user has admin role
  isNodeOfficer,          // True if user has node officer role
  hasRole,                // Function to check if user has a role

  // Auth actions (async versions)
  login,                  // Login function (returns Promise)
  logout,                 // Logout function (returns Promise)
  register,               // Register function (returns Promise)
  refreshSession,         // Refresh session function (returns Promise)

  // Auth actions (sync versions)
  loginSync,              // Login without waiting (no Promise)
  logoutSync,             // Logout without waiting (no Promise)
  registerSync,           // Register without waiting (no Promise)

  // Loading states for actions
  isLoggingIn,            // True while login is in progress
  isLoggingOut,           // True while logout is in progress
  isRegistering,          // True while registration is in progress

  // Navigation
  navigate,               // Function to navigate to a different route
} = useAuthSession();
```

## Example: Full Component Migration

Here's an example of migrating a complete component:

### Before

```tsx
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, session, signOut } = useAuth();
  const isAdmin = useIsAdmin();

  const handleLogout = async () => {
    await signOut();
    // Handle logout
  };

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      {isAdmin && <AdminPanel />}
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
}
```

### After

```tsx
import { useAuthSession } from "@/hooks/use-auth-session";

export default function ProfilePage() {
  const { user, session, logout, isAdmin } = useAuthSession();

  const handleLogout = async () => {
    await logout();
    // Handle logout
  };

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      {isAdmin && <AdminPanel />}
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
}
```

## Cleanup Process

After migrating all components to use the new `useAuthSession` hook, you can clean up the legacy authentication code:

1. Run the cleanup script to mark deprecated files and create removal scripts:

```bash
# Make the script executable
chmod +x scripts/cleanup-auth.sh

# Run the script
./scripts/cleanup-auth.sh
```

2. Review the list of files to be removed:

```bash
cat cleanup-files.txt
```

3. Remove legacy files:

```bash
./remove-legacy-auth.sh
```

4. Remove unused dependencies:

```bash
./remove-legacy-deps.sh
```

For more detailed instructions, see the [Authentication System Cleanup Guide](./auth-refactoring/cleanup-guide.md).

## Deprecated Hooks

The following hooks have been marked as deprecated but are maintained for backward compatibility:

1. `useSession` in `hooks/use-session.ts` - Wrapper around `useAuthSession`
2. `useSupabaseAuth` in `hooks/use-supabase-auth.ts` - Older version of the Supabase auth hook
3. `useAuth` in `lib/supabase-auth-context.tsx` - Auth context that now uses `useAuthSession` internally

These hooks will be removed in a future version, so it's recommended to migrate to `useAuthSession` as soon as possible.

## Need Help?

If you encounter any issues during migration, please contact the development team.