# Authentication Hooks

This directory contains hooks for authentication in the NGDI Portal application.

## Authentication Hook Consolidation

We previously had two separate authentication implementations:

1. React Query-based: `useSession` in `hooks/use-session.ts`
2. Context-based: `useAuth` in `lib/auth-context.tsx`

These have now been consolidated into a single unified implementation:

## Primary Authentication Hook

### `useAuthSession`

```jsx
import { useAuthSession } from "@/hooks/use-auth-session"

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout,
    isAdmin,
    // ... and more
  } = useAuthSession()
  
  // Use the auth state and methods
}
```

This hook provides all authentication functionality in one place:

- Session state (`session`, `user`, `isAuthenticated`, etc.)
- Authentication methods (`login`, `logout`, `register`, etc.)
- Role-based access control (`isAdmin`, `isNodeOfficer`, `hasRole`)
- Navigation helpers (`navigate`)
- Loading/error states (`isLoading`, `isLoggingIn`, etc.)

## Legacy Hooks (Deprecated)

The following hooks are maintained for backward compatibility but are deprecated:

- `useSession` in `hooks/use-session.ts`
- `useAuth` and related hooks in `lib/auth-context.tsx`

These hooks are now wrappers around `useAuthSession` and should not be used in new code.

## Migration Guide

To migrate from the old hooks to the new unified hook:

### From `useSession`:

```jsx
// Old
import { useSession } from "@/hooks/use-session"
const { 
  user, 
  login, 
  isLoggingIn 
} = useSession()

// New
import { useAuthSession } from "@/hooks/use-auth-session"
const { 
  user, 
  login, 
  isLoggingIn 
} = useAuthSession()
```

### From `useAuth`:

```jsx
// Old
import { useAuth } from "@/lib/auth-context"
const { 
  session, 
  status, 
  login 
} = useAuth()

// New
import { useAuthSession } from "@/hooks/use-auth-session"
const { 
  session, 
  status, 
  login 
} = useAuthSession()
```

## Benefits of Consolidation

1. **Single Source of Truth**: All authentication logic is in one place
2. **Consistent API**: Same interface used everywhere
3. **Improved Performance**: Shared caching and state management
4. **Better Developer Experience**: Clearer, more consistent auth API
5. **Easier Maintenance**: Changes to auth only need to be made in one place

## Implementation Details

The unified hook combines:

- React Query for data fetching and caching
- Navigation management with anti-flicker measures
- Session refresh logic
- Cookie validation
- Role checking helpers
- Toast notifications for user feedback

All future authentication enhancements should be added to `useAuthSession`. 