# Authentication System Refactoring

This directory contains documentation for the NGDI Portal's authentication system refactoring project, which aims to migrate from the current custom JWT-based authentication to using Supabase Auth exclusively.

## Documentation Structure

1. [Overview](./01-overview.md) - High-level overview of the refactoring project
2. [Implementation Plan](./02-implementation-plan.md) - Detailed implementation plan with tasks and technical details
3. [Tracking Document](./03-tracking.md) - Progress tracking for the refactoring project
4. [Code Samples](./code-samples.md) - Example code for implementing Supabase Auth
5. [Migration Guide](./migration-guide.md) - Guide for migrating from custom JWT to Supabase Auth

## Project Summary

The NGDI Portal currently uses a mix of custom JWT-based authentication and partial Supabase Auth integration. This refactoring project aims to simplify the authentication system by using Supabase Auth exclusively, while maintaining important security features like CSRF protection, rate limiting, and security logging.

### Key Goals

- Simplify authentication by using Supabase Auth as the single source of truth
- Maintain security features from the current implementation
- Improve developer experience with a consistent authentication API
- Reduce code duplication by removing redundant authentication code
- Ensure backward compatibility to minimize disruption

### Benefits

- Reduced maintenance burden with less custom code
- Improved security by leveraging Supabase's security features
- Better developer experience with a consistent API
- Simplified codebase with removal of duplicate and legacy code
- Future-proofing by making it easier to adopt new Supabase Auth features

## Getting Started

To begin working on this refactoring project:

1. Review the [Overview](./01-overview.md) to understand the project goals and approach
2. Study the [Implementation Plan](./02-implementation-plan.md) for detailed tasks and technical details
3. Use the [Tracking Document](./03-tracking.md) to track progress and update task statuses

## Implementation Approach

The refactoring will follow a phased approach:

1. **Preparation**: Audit existing code, identify dependencies, and create a detailed plan
2. **Implementation**: Refactor code in stages, starting with core authentication functionality
3. **Testing**: Comprehensive testing of the new authentication system
4. **Deployment**: Gradual rollout with monitoring and fallback options
5. **Cleanup**: Remove legacy authentication code once the new system is stable

## Technical Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
