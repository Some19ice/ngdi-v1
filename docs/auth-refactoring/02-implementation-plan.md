# Authentication System Refactoring: Detailed Implementation Plan

This document provides a detailed plan for refactoring the NGDI Portal's authentication system to use Supabase Auth exclusively.

## Phase 1: Preparation (2-3 days)

### 1.1 Code Audit and Mapping

- [ ] **Identify all authentication-related files**
  - Map all files in the API package related to authentication
  - Map all files in the web package related to authentication
  - Identify any other packages with authentication dependencies

- [ ] **Document current authentication flows**
  - Login flow
  - Registration flow
  - Password reset flow
  - Session management
  - Token refresh mechanism
  - Logout flow

- [ ] **Identify security features to preserve**
  - CSRF protection
  - Rate limiting
  - Account lockout
  - Password policies
  - Security logging
  - Email verification

- [ ] **Analyze Supabase Auth capabilities**
  - Document available Supabase Auth features
  - Identify gaps between current implementation and Supabase Auth
  - Plan for implementing missing features

### 1.2 Dependency Analysis

- [ ] **Identify components dependent on current auth system**
  - Protected routes
  - Role-based access control
  - Components using authentication state
  - API endpoints requiring authentication

- [ ] **Create dependency graph**
  - Map relationships between authentication components
  - Identify critical paths and potential breaking points

### 1.3 Database Schema Planning

- [ ] **Review current user data model**
  - Map current user schema to Supabase Auth user schema
  - Identify custom fields that need to be preserved
  - Plan for data migration

- [ ] **Design updated database schema**
  - Create schema for user metadata
  - Plan for role and permission storage
  - Design schema for security logs

### 1.4 Testing Strategy

- [ ] **Define test scenarios**
  - Authentication flows
  - Security features
  - Edge cases
  - Performance benchmarks

- [ ] **Create test environment**
  - Set up separate Supabase project for testing
  - Configure test environment variables

## Phase 2: Implementation (1-2 weeks)

### 2.1 Core Authentication Infrastructure (3-4 days)

- [ ] **Set up Supabase Auth client**
  - Configure Supabase Auth with appropriate settings
  - Implement proper environment variable handling
  - Set up authentication hooks and context providers

- [ ] **Implement authentication API layer**
  - Create unified authentication service
  - Implement adapter functions for backward compatibility
  - Set up proper error handling and logging

- [ ] **Implement session management**
  - Configure session persistence
  - Implement token refresh mechanism
  - Set up session expiration handling

### 2.2 Authentication Flows (2-3 days)

- [ ] **Implement login flow**
  - Create login form components
  - Implement login logic using Supabase Auth
  - Add remember me functionality
  - Implement proper error handling and feedback

- [ ] **Implement registration flow**
  - Create registration form components
  - Implement registration logic using Supabase Auth
  - Add email verification
  - Implement proper error handling and feedback

- [ ] **Implement password reset flow**
  - Create password reset form components
  - Implement password reset logic using Supabase Auth
  - Implement proper error handling and feedback

- [ ] **Implement logout flow**
  - Create logout functionality
  - Handle session cleanup
  - Implement proper redirection

### 2.3 Security Features (2-3 days)

- [ ] **Implement CSRF protection**
  - Configure Supabase Auth with CSRF protection
  - Implement custom CSRF middleware if needed
  - Test CSRF protection

- [ ] **Implement rate limiting**
  - Configure rate limiting for authentication endpoints
  - Implement custom rate limiting middleware if needed
  - Test rate limiting

- [ ] **Implement password policies**
  - Configure Supabase Auth with password policies
  - Implement custom password validation if needed
  - Test password policies

- [ ] **Implement security logging**
  - Set up logging for authentication events
  - Implement custom logging middleware if needed
  - Test security logging

### 2.4 API Integration (2-3 days)

- [ ] **Update API authentication middleware**
  - Create Supabase Auth middleware for API routes
  - Implement role-based access control
  - Test API authentication

- [ ] **Update protected routes**
  - Update route protection to use Supabase Auth
  - Implement role-based access control for routes
  - Test protected routes

## Phase 3: Testing (3-5 days)

### 3.1 Unit Testing

- [ ] **Test authentication services**
  - Test login, registration, and password reset
  - Test session management
  - Test error handling

- [ ] **Test security features**
  - Test CSRF protection
  - Test rate limiting
  - Test password policies

### 3.2 Integration Testing

- [ ] **Test authentication flows**
  - Test end-to-end login flow
  - Test end-to-end registration flow
  - Test end-to-end password reset flow

- [ ] **Test API integration**
  - Test API authentication
  - Test role-based access control
  - Test error handling

### 3.3 User Acceptance Testing

- [ ] **Test user experience**
  - Test login and registration forms
  - Test error messages and feedback
  - Test session persistence

- [ ] **Test edge cases**
  - Test account lockout
  - Test password reset with expired tokens
  - Test session expiration

## Phase 4: Deployment (1-2 days)

### 4.1 Preparation

- [ ] **Create deployment plan**
  - Define deployment steps
  - Create rollback plan
  - Prepare monitoring strategy

- [ ] **Update documentation**
  - Update developer documentation
  - Update user documentation
  - Create release notes

### 4.2 Deployment

- [ ] **Deploy database changes**
  - Run database migrations
  - Verify data integrity

- [ ] **Deploy code changes**
  - Deploy API changes
  - Deploy web changes
  - Verify deployment

### 4.3 Monitoring

- [ ] **Monitor authentication system**
  - Monitor login success rate
  - Monitor error rates
  - Monitor performance

- [ ] **Address issues**
  - Fix any issues that arise
  - Update documentation as needed

## Phase 5: Cleanup (1-2 days)

### 5.1 Code Cleanup

- [ ] **Remove legacy authentication code**
  - Remove custom JWT implementation
  - Remove deprecated authentication hooks
  - Remove unused middleware

- [ ] **Clean up dependencies**
  - Remove unused dependencies
  - Update package.json files

### 5.2 Final Verification

- [ ] **Verify authentication system**
  - Verify all authentication flows
  - Verify security features
  - Verify performance

- [ ] **Update documentation**
  - Finalize developer documentation
  - Finalize user documentation
  - Create maintenance guide

## Technical Implementation Details

### Supabase Auth Configuration

```typescript
// Example Supabase Auth configuration
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: {
        // Use cookies for better security
        getItem: (key) => {
          // Get from cookie
        },
        setItem: (key, value) => {
          // Set in cookie with proper security flags
        },
        removeItem: (key) => {
          // Remove from cookie
        },
      },
    },
  }
)
```

### Authentication Hook

```typescript
// Example authentication hook
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Get initial session
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Authentication methods
  const login = async (email: string, password: string) => {
    // Implementation
  }

  const register = async (email: string, password: string, name?: string) => {
    // Implementation
  }

  const logout = async () => {
    // Implementation
  }

  // Return auth state and methods
  return {
    session,
    user,
    loading,
    login,
    register,
    logout,
  }
}
```

### API Middleware

```typescript
// Example API middleware
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Get token from request
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "No authentication token provided",
        401
      )
    }

    // Verify token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !data.user) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        error?.message || "Invalid token",
        401
      )
    }

    // Set user in context
    c.set('user', {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata.role || 'user',
    })

    await next()
  } catch (error) {
    // Handle errors
  }
}
```

## Files to Modify or Create

### Web Package

- [ ] `packages/web/src/lib/supabase-auth.ts` (Update)
- [ ] `packages/web/src/hooks/use-auth-session.ts` (Update)
- [ ] `packages/web/src/lib/auth-context.tsx` (Update)
- [ ] `packages/web/src/middleware.ts` (Update)
- [ ] `packages/web/src/components/auth/protected-route.tsx` (Update)
- [ ] `packages/web/src/app/auth/signin/signin-content.tsx` (Update)
- [ ] `packages/web/src/app/auth/signup/signup-form.tsx` (Update)
- [ ] `packages/web/src/app/auth/reset-password/reset-password-form.tsx` (Update)

### API Package

- [ ] `packages/api/src/middleware/auth.middleware.ts` (Update)
- [ ] `packages/api/src/routes/auth.routes.ts` (Update)
- [ ] `packages/api/src/services/supabase-auth.service.ts` (Create)
- [ ] `packages/api/src/config/supabase.config.ts` (Create)

### Files to Remove

- [ ] `packages/api/src/services/auth.service.ts`
- [ ] `packages/api/src/utils/jwt.ts`
- [ ] `packages/api/src/services/token-validation.service.ts`
- [ ] `packages/web/src/hooks/use-auth.ts`
- [ ] `packages/web/src/lib/auth/validation.ts` (if not needed)

## Dependencies to Add or Update

- [ ] `@supabase/supabase-js` (Update to latest version)
- [ ] `@supabase/auth-helpers-nextjs` (Add)
- [ ] `@supabase/ssr` (Add if not already present)

## Dependencies to Remove

- [ ] `jsonwebtoken` (if not needed elsewhere)
- [ ] `bcryptjs` (if not needed elsewhere)
- [ ] `jose` (if not needed elsewhere)
