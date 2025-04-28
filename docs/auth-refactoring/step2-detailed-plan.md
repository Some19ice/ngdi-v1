# Authentication System Refactoring Plan - Detailed Implementation

## Overview

This document outlines the detailed plan to refactor the NGDI Portal's authentication system to use Supabase Auth exclusively, removing the legacy authentication system and related code files.

## Current State Analysis

### Legacy Authentication Components

1. **API Package**:
   - Custom JWT token generation and validation (`jwt.ts`)
   - Token validation service (`token-validation.service.ts`)
   - Authentication middleware (`auth.middleware.ts`)
   - Authentication routes (`auth.routes.ts`)
   - Password policy service (`password-policy.service.ts`)
   - Security logging service (`security-log.service.ts`)

2. **Web Package**:
   - Multiple authentication hooks (`use-auth.ts`, `use-auth-session.ts`)
   - Authentication context (`auth-context.tsx`)
   - Authentication client (`auth-client.ts`)
   - Route protection middleware (`middleware.ts`)

### Existing Supabase Integration

1. **Web Package**:
   - Supabase client initialization (`supabase-client.ts`, `supabase.ts`)
   - Supabase Auth utilities (`supabase-auth.ts`)
   - Supabase server-side utilities (`supabase-server.ts`)

## Detailed Implementation Plan

### Phase 1: Preparation (1 week)

#### 1.1 Comprehensive Authentication Audit

- **Tasks**:
  - Create inventory of all authentication-related files
  - Document authentication flows with sequence diagrams
  - Identify all components that depend on authentication
  - Map user roles and permissions to Supabase Auth

- **Deliverables**:
  - Authentication inventory document
  - Authentication flow diagrams
  - Dependency map

#### 1.2 Supabase Auth Configuration

- **Tasks**:
  - Configure Supabase Auth settings in dashboard
  - Set up email templates for verification, password reset
  - Configure password policies to match current requirements
  - Set up social providers if needed
  - Create custom claims for user roles

- **Deliverables**:
  - Configured Supabase project
  - Email templates
  - Configuration documentation

#### 1.3 Create Test Environment

- **Tasks**:
  - Set up separate test environment
  - Create test user accounts
  - Implement feature flags for gradual rollout

- **Deliverables**:
  - Test environment documentation
  - Test accounts
  - Feature flag implementation

### Phase 2: Implementation (2 weeks)

#### 2.1 API Package Supabase Integration

- **Tasks**:
  - Create Supabase client in API package
  ```typescript
  // Example implementation
  import { createClient } from '@supabase/supabase-js'
  
  export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  ```
  
  - Implement token validation middleware using Supabase
  ```typescript
  // Example implementation
  export async function supabaseAuthMiddleware(c: Context, next: Next) {
    const token = c.req.header('Authorization')?.split('Bearer ')[1]
    
    if (!token) {
      throw new AuthError(AuthErrorCode.INVALID_TOKEN, 'No token provided', 401)
    }
    
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !data.user) {
      throw new AuthError(AuthErrorCode.INVALID_TOKEN, 'Invalid token', 401)
    }
    
    // Set user in context
    c.set('user', {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata.role || 'USER',
    })
    
    await next()
  }
  ```
  
  - Create adapter for role-based access control
  - Implement proxy endpoints for Supabase Auth operations

- **Deliverables**:
  - Supabase client implementation
  - Authentication middleware
  - Role-based access control adapter
  - Auth proxy endpoints

#### 2.2 Web Package Supabase Enhancement

- **Tasks**:
  - Standardize on a single authentication hook using Supabase
  ```typescript
  // Example implementation
  export function useSupabaseAuth() {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setLoading(false)
        }
      )
      
      return () => subscription.unsubscribe()
    }, [])
    
    return {
      session,
      user,
      loading,
      isAuthenticated: !!user,
      // Add other methods...
    }
  }
  ```
  
  - Update authentication components to use Supabase Auth
  - Implement session management with refresh
  - Create adapters for existing authentication consumers

- **Deliverables**:
  - Unified authentication hook
  - Updated authentication components
  - Session management implementation
  - Authentication adapters

#### 2.3 User Data Migration

- **Tasks**:
  - Create migration script for user data
  ```typescript
  // Example migration script outline
  async function migrateUsers() {
    const users = await prisma.user.findMany()
    
    for (const user of users) {
      // Create user in Supabase
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: generateTemporaryPassword(),
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        }
      })
      
      if (error) {
        console.error(`Failed to migrate user ${user.email}:`, error)
        continue
      }
      
      // Update user mapping
      await prisma.userMapping.create({
        data: {
          legacyId: user.id,
          supabaseId: data.user.id,
        }
      })
    }
  }
  ```
  
  - Implement password reset flow for migrated users
  - Create user role mapping
  - Preserve user metadata

- **Deliverables**:
  - User migration script
  - Password reset flow
  - User role mapping
  - Migration documentation

### Phase 3: Transition and Testing (1 week)

#### 3.1 Parallel Running

- **Tasks**:
  - Implement feature flag for Supabase Auth
  - Run both authentication systems in parallel
  - Add logging for comparison
  - Create fallback mechanism

- **Deliverables**:
  - Feature flag implementation
  - Parallel authentication system
  - Comparison logs
  - Fallback mechanism

#### 3.2 Comprehensive Testing

- **Tasks**:
  - Create test suite for authentication flows
  - Test role-based access control
  - Test session management
  - Test error handling
  - Perform security testing

- **Deliverables**:
  - Authentication test suite
  - Test results documentation
  - Security assessment

### Phase 4: Cleanup and Documentation (1 week)

#### 4.1 Remove Legacy Code

- **Tasks**:
  - Remove custom JWT utilities
  - Remove custom authentication services
  - Remove deprecated authentication hooks
  - Clean up dependencies

- **Deliverables**:
  - Clean codebase
  - Reduced bundle size
  - Simplified dependency tree

#### 4.2 Update Documentation

- **Tasks**:
  - Update API documentation
  - Update developer guides
  - Document new authentication flows
  - Create troubleshooting guide

- **Deliverables**:
  - Updated documentation
  - Authentication flow diagrams
  - Troubleshooting guide

## File Removal Plan

The following files should be removed after the migration:

### API Package
- `src/utils/jwt.ts`
- `src/services/token-validation.service.ts`
- `src/middleware/auth.middleware.ts` (replace with Supabase version)
- `src/services/auth.service.ts`

### Web Package
- `src/hooks/use-auth.ts` (deprecated)
- `src/lib/auth-context.tsx` (if not needed with Supabase)
- `src/lib/auth-client.ts` (replace with Supabase client)

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Session disruption for users | High | Medium | Implement graceful transition with parallel systems |
| Loss of security features | High | Medium | Ensure Supabase Auth is configured with equivalent security |
| Integration issues with existing code | Medium | High | Comprehensive testing and adapter pattern |
| Data migration errors | High | Medium | Backup data, test migration in staging |
| Performance degradation | Medium | Low | Monitor performance metrics during transition |

## Success Criteria

1. All authentication flows use Supabase Auth
2. Legacy authentication code is removed
3. No regression in security features
4. No disruption to user experience
5. Simplified codebase with reduced maintenance burden

## Timeline

- Phase 1 (Preparation): Week 1
- Phase 2 (Implementation): Weeks 2-3
- Phase 3 (Transition and Testing): Week 4
- Phase 4 (Cleanup and Documentation): Week 5

## Rollback Plan

In case of critical issues:

1. Revert to feature flag for legacy authentication
2. Restore removed code from version control
3. Communicate with users about temporary authentication issues
4. Address issues and retry migration with lessons learned
