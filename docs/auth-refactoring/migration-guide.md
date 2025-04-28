# Authentication Migration Guide: From Custom JWT to Supabase Auth

This guide provides instructions for migrating from the current custom JWT-based authentication system to Supabase Auth. It is intended for developers working on the NGDI Portal refactoring project.

## Table of Contents

1. [Understanding the Migration](#understanding-the-migration)
2. [Key Differences](#key-differences)
3. [Migration Steps for Frontend Developers](#migration-steps-for-frontend-developers)
4. [Migration Steps for Backend Developers](#migration-steps-for-backend-developers)
5. [Testing the Migration](#testing-the-migration)
6. [Troubleshooting](#troubleshooting)

## Understanding the Migration

The NGDI Portal is transitioning from a custom JWT-based authentication system to Supabase Auth. This migration will simplify the codebase, improve security, and leverage Supabase's robust authentication features.

### Current System

- Custom JWT generation and validation
- Custom middleware for authentication
- Mix of localStorage and cookie-based token storage
- Multiple authentication hooks and contexts

### Target System

- Supabase Auth for authentication
- Supabase session management
- Secure HTTP-only cookie storage for tokens
- Unified authentication hook and context

## Key Differences

### Token Handling

**Before:**
```typescript
// Generate token
const token = await generateToken({ userId, email, role })

// Validate token
const validationResult = await tokenValidationService.validateAccessToken(token)
```

**After:**
```typescript
// Sign in with Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// Get user from token
const { data, error } = await supabaseAdmin.auth.getUser(token)
```

### User Session Management

**Before:**
```typescript
// Get session from custom hook
const { session, user } = useAuth()

// Refresh token
const newToken = await refreshToken(refreshToken)
```

**After:**
```typescript
// Get session from Supabase hook
const { data: { session } } = await supabase.auth.getSession()

// Refresh session (handled automatically by Supabase)
const { data, error } = await supabase.auth.refreshSession()
```

### Role-Based Access Control

**Before:**
```typescript
// Check role in middleware
if (user.role !== UserRole.ADMIN) {
  throw new AuthError(AuthErrorCode.FORBIDDEN, "Admin access required", 403)
}
```

**After:**
```typescript
// Check role from Supabase user metadata
const role = user.user_metadata?.role || UserRole.USER

if (role !== UserRole.ADMIN) {
  throw new AuthError(AuthErrorCode.FORBIDDEN, "Admin access required", 403)
}
```

## Migration Steps for Frontend Developers

### 1. Update Supabase Client Configuration

Ensure the Supabase client is properly configured for authentication:

```typescript
// packages/web/src/lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    }
  )
}
```

### 2. Update Authentication Hook

Replace the current authentication hook with a Supabase-based implementation:

```typescript
// packages/web/src/hooks/use-auth-session.ts
export function useAuthSession() {
  const supabase = createClient()
  // Implementation using Supabase Auth
  // See code-samples.md for full implementation
}
```

### 3. Update Protected Routes

Update protected route components to use the new authentication hook:

```typescript
// packages/web/src/components/auth/protected-route.tsx
export function ProtectedRoute({ children, allowedRoles }) {
  const { session, isLoading } = useAuthSession()
  // Implementation using Supabase Auth
  // See code-samples.md for full implementation
}
```

### 4. Update Authentication Forms

Update login, registration, and password reset forms to use Supabase Auth:

```typescript
// packages/web/src/components/auth/login-form.tsx
export function LoginForm() {
  const { login } = useAuthSession()
  
  const onSubmit = async (values) => {
    await login(values.email, values.password)
    // Implementation using Supabase Auth
    // See code-samples.md for full implementation
  }
}
```

### 5. Update Next.js Middleware

Update the middleware to use Supabase Auth for route protection:

```typescript
// packages/web/src/middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
  // Implementation using Supabase Auth
  // See code-samples.md for full implementation
}
```

## Migration Steps for Backend Developers

### 1. Set Up Supabase Admin Client

Create a Supabase admin client for server-side operations:

```typescript
// packages/api/src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### 2. Update Authentication Middleware

Replace the current authentication middleware with a Supabase-based implementation:

```typescript
// packages/api/src/middleware/auth.middleware.ts
export async function authMiddleware(c: Context, next: Next) {
  // Get token from request
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  // Validate token with Supabase
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  
  // Implementation using Supabase Auth
  // See code-samples.md for full implementation
}
```

### 3. Update Authentication Routes

Update authentication routes to use Supabase Auth:

```typescript
// packages/api/src/routes/auth.routes.ts
auth.post("/login", async (c) => {
  // Implementation using Supabase Auth
  // This might be removed entirely if frontend calls Supabase directly
})
```

### 4. Implement Security Features

Implement security features like CSRF protection and rate limiting:

```typescript
// packages/api/src/middleware/csrf.ts
// CSRF middleware implementation

// packages/api/src/middleware/rate-limit.ts
// Rate limiting middleware implementation
```

### 5. Update Security Logging

Update security logging to work with Supabase Auth:

```typescript
// packages/api/src/services/security-log.service.ts
export class SecurityLogService {
  // Updated implementation for Supabase Auth
}
```

## Testing the Migration

### 1. Test Authentication Flows

- Test login flow
- Test registration flow
- Test password reset flow
- Test logout flow

### 2. Test Protected Routes

- Test access to protected routes when authenticated
- Test redirection to login when not authenticated
- Test role-based access control

### 3. Test Security Features

- Test CSRF protection
- Test rate limiting
- Test account lockout
- Test password policies

### 4. Test Edge Cases

- Test token expiration and refresh
- Test invalid tokens
- Test concurrent sessions

## Troubleshooting

### Common Issues

#### 1. Session Not Persisting

**Problem:** User session is not persisting after page refresh.

**Solution:** Ensure Supabase client is configured with `persistSession: true` and cookies are properly configured.

#### 2. CORS Issues

**Problem:** CORS errors when making requests to Supabase.

**Solution:** Ensure Supabase project has the correct CORS configuration.

#### 3. Role-Based Access Not Working

**Problem:** Role-based access control is not working correctly.

**Solution:** Ensure user roles are properly stored in Supabase user metadata and retrieved correctly.

#### 4. Token Validation Failures

**Problem:** Token validation is failing in API middleware.

**Solution:** Ensure the correct Supabase service role key is being used and the token is being extracted correctly from the request.

### Getting Help

If you encounter issues during the migration, please:

1. Check the [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
2. Review the code samples in this repository
3. Reach out to the project lead for assistance

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
