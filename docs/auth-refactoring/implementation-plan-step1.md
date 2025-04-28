# Authentication System Refactoring: Supabase Migration Plan

## Overview

This document outlines the plan to refactor the NGDI Portal's authentication system to use Supabase Auth exclusively, removing the legacy authentication system and related code files.

## Current State

The application currently uses a hybrid authentication approach:

- **Legacy System**: Custom JWT-based authentication in the API package with token validation, middleware, and security features
- **Partial Supabase Integration**: Some Supabase Auth functionality in the web package
- **Duplication**: Multiple authentication hooks and utilities across the codebase

## Goals

1. Migrate to Supabase Auth as the exclusive authentication provider
2. Remove legacy authentication code and eliminate duplication
3. Maintain or enhance existing security features
4. Ensure a seamless transition for users
5. Simplify the codebase and reduce maintenance burden

## High-Level Approach

1. **Preparation**: Audit current system and configure Supabase Auth
2. **Implementation**: Integrate Supabase Auth in API and web packages
3. **Migration**: Move user data to Supabase Auth
4. **Transition**: Run systems in parallel with feature flags
5. **Cleanup**: Remove legacy code and update documentation

## Timeline

- **Week 1**: Preparation and planning
- **Weeks 2-3**: Implementation and migration
- **Week 4**: Testing and transition
- **Week 5**: Cleanup and documentation

## Success Criteria

1. All authentication flows use Supabase Auth
2. Legacy authentication code is removed
3. No regression in security features
4. No disruption to user experience
5. Simplified codebase with reduced maintenance burden
