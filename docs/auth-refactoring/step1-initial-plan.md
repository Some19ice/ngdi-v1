# Authentication System Refactoring Plan - Initial Draft

## Overview

This document outlines the plan to refactor the NGDI Portal's authentication system to use Supabase Auth exclusively, removing the legacy authentication system and related code files.

## Current State

The application currently has:
- A custom JWT-based authentication system in the API package
- Partial Supabase Auth integration in the web package
- Duplicate authentication logic across multiple files
- Multiple authentication hooks (some deprecated)

## Goals

1. Migrate to Supabase Auth exclusively
2. Remove legacy authentication code
3. Standardize authentication patterns
4. Maintain existing security features
5. Minimize disruption to users

## Implementation Plan

### Phase 1: Preparation

1. **Audit Current Authentication System**
   - Identify all files related to the legacy authentication system
   - Document current authentication flows
   - Map out dependencies on the current system

2. **Set Up Supabase Auth Configuration**
   - Configure Supabase Auth settings
   - Set up email templates
   - Configure social providers if needed

### Phase 2: Implementation

1. **Implement Supabase Auth in API Package**
   - Create Supabase client in API package
   - Implement token validation middleware using Supabase
   - Update role-based access control

2. **Enhance Web Package Supabase Integration**
   - Standardize on a single authentication hook
   - Update components to use Supabase Auth
   - Implement session management

3. **Migrate User Data**
   - Create migration script for user data
   - Handle password migration
   - Preserve user roles and permissions

### Phase 3: Cleanup

1. **Remove Legacy Code**
   - Remove custom JWT utilities
   - Remove custom authentication services
   - Remove deprecated authentication hooks

2. **Update Documentation**
   - Update API documentation
   - Update developer guides
   - Document new authentication flows

## Timeline

- Phase 1: 1 week
- Phase 2: 2 weeks
- Phase 3: 1 week

## Risks and Mitigations

- **Risk**: Session disruption for users
  - **Mitigation**: Implement graceful transition period

- **Risk**: Loss of security features
  - **Mitigation**: Ensure Supabase Auth is configured with equivalent security

- **Risk**: Integration issues with existing code
  - **Mitigation**: Comprehensive testing plan

## Success Criteria

1. All authentication flows use Supabase Auth
2. Legacy authentication code is removed
3. No regression in security features
4. No disruption to user experience
