# Authentication System Refactoring: Migration to Supabase Auth

## Overview

This document outlines the plan to refactor the NGDI Portal's authentication system to use Supabase Auth exclusively, removing the legacy authentication implementation. The goal is to simplify the codebase, improve security, and leverage Supabase's robust authentication features.

## Current State

The application currently has multiple authentication implementations:

1. **Custom JWT-based Authentication**:
   - Implemented in the API package with custom token generation, validation, and middleware
   - Includes features like CSRF protection, rate limiting, and security logging
   - Uses HTTP-only cookies and local storage for token storage

2. **Partial Supabase Auth Implementation**:
   - Some Supabase Auth client code exists but is not fully integrated
   - Appears to be a work in progress or parallel implementation

3. **Legacy/Deprecated Authentication Code**:
   - Multiple authentication hooks with some marked as deprecated
   - Inconsistent token storage approaches (localStorage in some places, cookies in others)
   - Duplicate validation logic across the codebase

## Goals

1. **Simplify Authentication**: Use Supabase Auth as the single source of truth for authentication
2. **Maintain Security Features**: Preserve important security features like CSRF protection, rate limiting, and security logging
3. **Improve Developer Experience**: Provide a consistent, well-documented authentication API
4. **Reduce Code Duplication**: Remove redundant authentication code
5. **Ensure Backward Compatibility**: Minimize disruption to existing functionality

## Benefits

1. **Reduced Maintenance Burden**: Less custom code to maintain
2. **Improved Security**: Leverage Supabase's security features and updates
3. **Better Developer Experience**: Consistent authentication API
4. **Simplified Codebase**: Removal of duplicate and legacy code
5. **Future-Proofing**: Easier to adopt new Supabase Auth features

## High-Level Approach

The migration will follow these phases:

1. **Preparation**: Audit existing code, identify dependencies, and create a detailed plan
2. **Implementation**: Refactor code in stages, starting with core authentication functionality
3. **Testing**: Comprehensive testing of the new authentication system
4. **Deployment**: Gradual rollout with monitoring and fallback options
5. **Cleanup**: Remove legacy authentication code once the new system is stable

## Timeline

The estimated timeline for this refactoring is 2-3 weeks, broken down as follows:

- Preparation: 2-3 days
- Implementation: 1-2 weeks
- Testing: 3-5 days
- Deployment: 1-2 days
- Cleanup: 1-2 days

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Disruption to user sessions | Implement a session migration strategy |
| Missing security features | Ensure all critical security features are preserved or replaced |
| API incompatibilities | Create adapter functions for backward compatibility |
| Data migration issues | Plan and test user data migration thoroughly |
| Performance impacts | Benchmark before and after to ensure no degradation |

## Next Steps

See the detailed implementation plan in [02-implementation-plan.md](./02-implementation-plan.md) for specific tasks and timelines.
