# Proposal: Decoupling Supabase Auth from Prisma

## 1. Analysis of Current Coupling Issues

Our current implementation tightly couples Supabase Auth with Prisma, leading to several challenges:

### 1.1. Identified Issues

#### Duplicate User Storage
- User data is stored in both Supabase Auth and Prisma's `User` model
- Changes to user profiles must be synchronized across two systems
- Inconsistencies can occur when updates fail in one system but succeed in another

#### Tightly Coupled Authentication Flows
- Authentication flows (`login`, `register`, etc.) interact directly with both systems
- Simple operations require complex transaction-like patterns to maintain consistency
- Error recovery is challenging when a user is created in Supabase but fails in Prisma

#### Complex Session Management
- Session validation requires querying both Supabase for auth status and Prisma for additional user data
- Performance is affected by multiple database calls for common operations
- Caching becomes complex due to dual data sources

#### Rigid User Model
- Changes to the Prisma `User` model often require corresponding changes in auth-related code
- Hard-coded references to the `User` model exist throughout the codebase
- Testing is more difficult due to coupled dependencies

#### Maintenance Burden
- Developers need to understand both systems to make changes
- Bug fixes often span multiple repositories/systems
- Security updates require coordinated changes

### 1.2. Specific Code Examples of Coupling

```typescript
// Example from supabase-auth.service.ts
async getUserData(userId: string): Promise<UserData | null> {
  // First get user from Supabase
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
  
  // Then query Prisma for the same user
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organization: true,
      department: true,
      phone: true,
    },
  })
  
  // Merge data from both sources
  return {
    id: data.user.id,
    email: data.user.email,
    // ... more properties
    ...dbUser, // Merge with Prisma data
  }
}
```

## 2. Proposed Architecture

We propose a clean separation between authentication concerns and user data management through an abstraction layer:

### 2.1. Architecture Overview

![Architecture Diagram]
```
┌───────────────────┐     ┌───────────────────┐
│  Application      │     │  Admin Dashboard  │
└─────────┬─────────┘     └─────────┬─────────┘
          │                         │
          ▼                         ▼
┌─────────────────────────────────────────────┐
│           Authentication Service             │
│                                             │
│  ┌─────────────────┐   ┌────────────────┐   │
│  │ Auth Provider   │   │ User Identity  │   │
│  │ Interface       │◄──┤ Manager        │   │
│  └────────┬────────┘   └────────────────┘   │
│           │                                  │
└───────────┼──────────────────────────────────┘
            │
            ▼
┌───────────────────────┐     ┌───────────────────────┐
│                       │     │                       │
│  Supabase Auth        │     │  User Repository      │
│  Implementation       │     │  (Prisma)             │
│                       │     │                       │
└───────────────────────┘     └───────────────────────┘
```

### 2.2. Key Architectural Principles

#### Separation of Concerns
- **Authentication**: Responsible only for verifying user identity, managing tokens, and sessions
- **User Data Management**: Handles user profile data, preferences, and application-specific attributes
- **Synchronization**: A dedicated component manages the consistency between auth provider and user data

#### Abstraction Layers
- An auth provider interface allows for potential replacement of Supabase with another provider
- A user identity service acts as the single source of truth for applications
- Repository pattern isolates database operations

#### Data Ownership
- Supabase Auth: Minimal identity information (email, password, base metadata)
- Prisma: Extended user profile and application-specific data
- Clear boundaries for which system owns which data

#### Event-Driven Synchronization
- Events trigger synchronization between systems when needed
- Eventual consistency model for non-critical data
- Strong consistency for security-critical operations

## 3. Key Components to Implement

### 3.1. Core Components

#### 3.1.1 IAuthProvider Interface
An abstraction over authentication providers with a standard interface for auth operations.

#### 3.1.2 SupabaseAuthProvider Implementation
Concrete implementation of the IAuthProvider interface using Supabase.

#### 3.1.3 UserIdentityService
Unified service for all user identity operations, coordinating between auth provider and user repository.

#### 3.1.4 IUserRepository Interface
Abstract interface for user data operations.

#### 3.1.5 PrismaUserRepository Implementation
Concrete implementation using Prisma for user data storage.

#### 3.1.6 AuthSynchronizer
Handles synchronization between auth provider and user repository.

#### 3.1.7 AuthEvents
Event definitions for auth-related actions.

### 3.2. Supporting Components

#### 3.2.1 UserMapper
Maps between different user representations (auth provider user, domain user, database user).

#### 3.2.2 TokenService
Manages token validation, refresh, and storage.

#### 3.2.3 Session Manager
Handles user sessions across the application.

## 4. Code Examples for Core Interfaces and Classes

### 4.1. IAuthProvider Interface

```typescript
// packages/auth/src/interfaces/auth-provider.interface.ts
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified?: Date | null;
  metadata?: Record<string, any>;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface IAuthProvider {
  // Authentication methods
  signIn(credentials: AuthCredentials): Promise<AuthSession>;
  signUp(credentials: AuthCredentials, userData?: Record<string, any>): Promise<AuthSession>;
  signOut(userId: string): Promise<void>;
  
  // Token/session methods
  validateToken(token: string): Promise<AuthUser | null>;
  refreshToken(token: string): Promise<AuthSession | null>;
  
  // User management methods
  getUser(userId: string): Promise<AuthUser | null>;
  updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<AuthUser>;
  deleteUser(userId: string): Promise<void>;
  
  // Password management
  resetPassword(email: string): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}
```

### 4.2. Supabase Auth Provider Implementation

```typescript
// packages/auth/src/providers/supabase-auth.provider.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAuthProvider, AuthCredentials, AuthUser, AuthSession } from '../interfaces/auth-provider.interface';

export class SupabaseAuthProvider implements IAuthProvider {
  private client: SupabaseClient;
  
  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }
  
  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    const { email, password } = credentials;
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    if (!data.session || !data.user) {
      throw new Error('No session returned from authentication provider');
    }
    
    return this.mapToAuthSession(data.session, data.user);
  }
  
  async signUp(credentials: AuthCredentials, userData?: Record<string, any>): Promise<AuthSession> {
    const { email, password } = credentials;
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: userData || {},
      },
    });
    
    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
    
    if (!data.session || !data.user) {
      throw new Error('No session returned from authentication provider');
    }
    
    return this.mapToAuthSession(data.session, data.user);
  }
  
  async signOut(userId: string): Promise<void> {
    // In Supabase, we don't need the userId for signOut
    const { error } = await this.client.auth.signOut();
    
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }
  
  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await this.client.auth.getUser(token);
      
      if (error || !data.user) {
        return null;
      }
      
      return this.mapToAuthUser(data.user);
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }
  
  async refreshToken(refreshToken: string): Promise<AuthSession | null> {
    try {
      const { data, error } = await this.client.auth.refreshSession({
        refresh_token: refreshToken,
      });
      
      if (error || !data.session || !data.user) {
        return null;
      }
      
      return this.mapToAuthSession(data.session, data.user);
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }
  
  async getUser(userId: string): Promise<AuthUser | null> {
    // Supabase doesn't directly support getting user by ID from client
    // In a real implementation, you might use admin API or another approach
    // This is simplified for the example
    try {
      const { data, error } = await this.client.auth.admin.getUserById(userId);
      
      if (error || !data.user) {
        return null;
      }
      
      return this.mapToAuthUser(data.user);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
  
  async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<AuthUser> {
    const { data, error } = await this.client.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    );
    
    if (error || !data.user) {
      throw new Error(`Failed to update user metadata: ${error?.message}`);
    }
    
    return this.mapToAuthUser(data.user);
  }
  
  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.client.auth.admin.deleteUser(userId);
    
    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
  
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // In Supabase, password change is done via update
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }
  
  private mapToAuthUser(supabaseUser: any): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      emailVerified: supabaseUser.email_confirmed_at 
        ? new Date(supabaseUser.email_confirmed_at) 
        : null,
      metadata: supabaseUser.user_metadata || {},
    };
  }
  
  private mapToAuthSession(supabaseSession: any, supabaseUser: any): AuthSession {
    return {
      user: this.mapToAuthUser(supabaseUser),
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: new Date(supabaseSession.expires_at * 1000),
    };
  }
}
```

### 4.3. IUserRepository Interface

```typescript
// packages/auth/src/interfaces/user-repository.interface.ts
export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  emailVerified?: Date | null;
  organization?: string | null;
  department?: string | null;
  phone?: string | null;
  // Other application-specific fields
}

export interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByEmail(email: string): Promise<UserProfile | null>;
  create(user: Omit<UserProfile, 'id'>): Promise<UserProfile>;
  update(id: string, data: Partial<UserProfile>): Promise<UserProfile>;
  delete(id: string): Promise<void>;
  syncWithAuth(authUser: { id: string; email: string; emailVerified?: Date | null }): Promise<UserProfile>;
}
```

### 4.4. UserIdentityService

```typescript
// packages/auth/src/services/user-identity.service.ts
import { IAuthProvider, AuthCredentials, AuthUser, AuthSession } from '../interfaces/auth-provider.interface';
import { IUserRepository, UserProfile } from '../interfaces/user-repository.interface';
import { EventEmitter } from 'events';

export enum AuthEvent {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_SIGNED_IN = 'user.signed_in',
  USER_SIGNED_OUT = 'user.signed_out',
}

interface SignUpData {
  email: string;
  password: string;
  name?: string;
  role?: string;
  organization?: string;
  department?: string;
  phone?: string;
}

export class UserIdentityService {
  private eventEmitter: EventEmitter;
  
  constructor(
    private authProvider: IAuthProvider,
    private userRepository: IUserRepository
  ) {
    this.eventEmitter = new EventEmitter();
  }
  
  /**
   * Register for auth events
   */
  onEvent(event: AuthEvent, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }
  
  /**
   * Sign in a user
   */
  async signIn(email: string, password: string): Promise<{ user: UserProfile; session: AuthSession }> {
    // Authenticate with the auth provider
    const authSession = await this.authProvider.signIn({ email, password });
    
    // Get or create the user in our repository
    let userProfile = await this.userRepository.findById(authSession.user.id);
    
    if (!userProfile) {
      // If user exists in auth provider but not in our repository, synchronize
      userProfile = await this.userRepository.syncWithAuth(authSession.user);
    } else {
      // Update email verification status if needed
      if (authSession.user.emailVerified && !userProfile.emailVerified) {
        userProfile = await this.userRepository.update(authSession.user.id, {
          emailVerified: authSession.user.emailVerified,
        });
      }
    }
    
    // Emit sign-in event
    this.eventEmitter.emit(AuthEvent.USER_SIGNED_IN, userProfile);
    
    return { user: userProfile, session: authSession };
  }
  
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<{ user: UserProfile; session: AuthSession }> {
    const { email, password, ...profileData } = data;
    
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create user in auth provider
    const authSession = await this.authProvider.signUp(
      { email, password },
      { name: profileData.name, role: profileData.role || 'USER' }
    );
    
    // Create user in repository
    const userProfile = await this.userRepository.create({
      id: authSession.user.id, // Use the ID from auth provider
      email,
      emailVerified: authSession.user.emailVerified,
      role: profileData.role || 'USER',
      ...profileData,
    });
    
    // Emit creation event
    this.eventEmitter.emit(AuthEvent.USER_CREATED, userProfile);
    
    return { user: userProfile, session: authSession };
  }
  
  /**
   * Sign out a user
   */
  async signOut(userId: string): Promise<void> {
    await this.authProvider.signOut(userId);
    
    // Emit sign-out event
    this.eventEmitter.emit(AuthEvent.USER_SIGNED_OUT, userId);
  }
  
  /**
   * Validate a token and get user profile
   */
  async validateTokenAndGetUser(token: string): Promise<UserProfile | null> {
    const authUser = await this.authProvider.validateToken(token);
    
    if (!authUser) {
      return null;
    }
    
    // Get user from repository
    const userProfile = await this.userRepository.findById(authUser.id);
    
    if (!userProfile) {
      // If user exists in auth provider but not in our repository, synchronize
      return this.userRepository.syncWithAuth(authUser);
    }
    
    return userProfile;
  }
  
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userRepository.findById(userId);
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    // Extract what should be updated in auth provider vs. repository
    const { name, ...repositoryData } = data;
    
    // Update metadata in auth provider if name changes
    if (name !== undefined) {
      await this.authProvider.updateUserMetadata(userId, { name });
    }
    
    // Update user in repository
    const userProfile = await this.userRepository.update(userId, data);
    
    // Emit update event
    this.eventEmitter.emit(AuthEvent.USER_UPDATED, userProfile);
    
    return userProfile;
  }
  
  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    // Delete from auth provider first
    await this.authProvider.deleteUser(userId);
    
    // Then delete from repository
    await this.userRepository.delete(userId);
    
    // Emit deletion event
    this.eventEmitter.emit(AuthEvent.USER_DELETED, userId);
  }
  
  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    await this.authProvider.resetPassword(email);
  }
  
  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.authProvider.changePassword(userId, oldPassword, newPassword);
  }
}
```

### 4.5. PrismaUserRepository Implementation

```typescript
// packages/auth/src/repositories/prisma-user.repository.ts
import { PrismaClient, User } from '@prisma/client';
import { IUserRepository, UserProfile } from '../interfaces/user-repository.interface';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    return user ? this.mapToUserProfile(user) : null;
  }
  
  async findByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    
    return user ? this.mapToUserProfile(user) : null;
  }
  
  async create(userData: Omit<UserProfile, 'id'> & { id: string }): Promise<UserProfile> {
    const user = await this.prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
        role: userData.role,
        emailVerified: userData.emailVerified || null,
        organization: userData.organization || null,
        department: userData.department || null,
        phone: userData.phone || null,
      },
    });
    
    return this.mapToUserProfile(user);
  }
  
  async update(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
      },
    });
    
    return this.mapToUserProfile(user);
  }
  
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
  
  async syncWithAuth(authUser: { id: string; email: string; emailVerified?: Date | null }): Promise<UserProfile> {
    // Look for existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { id: authUser.id },
    });
    
    if (existingUser) {
      // Update if exists
      return this.update(authUser.id, {
        email: authUser.email,
        emailVerified: authUser.emailVerified,
      });
    } else {
      // Create if doesn't exist
      return this.create({
        id: authUser.id,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        role: 'USER', // Default role
      });
    }
  }
  
  private mapToUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      organization: user.organization,
      department: user.department,
      phone: user.phone,
    };
  }
}
```

## 5. Migration Steps

Transitioning from the current tightly coupled implementation to the decoupled architecture will require a phased approach:

### 5.1. Phase 1: Preparation

#### 5.1.1. Create New Package Structure

Create a new `packages/auth` package with the following structure:

```
packages/auth/
├── src/
│   ├── interfaces/
│   │   ├── auth-provider.interface.ts
│   │   └── user-repository.interface.ts
│   ├── providers/
│   │   └── supabase-auth.provider.ts
│   ├── repositories/
│   │   └── prisma-user.repository.ts
│   ├── services/
│   │   ├── user-identity.service.ts
│   │   └── token.service.ts
│   ├── utils/
│   │   └── user-mapper.ts
│   └── index.ts
└── package.json
```

#### 5.1.2. Implement Core Interfaces

Implement the following core interfaces and classes:
- `IAuthProvider` interface
- `IUserRepository` interface
- `SupabaseAuthProvider` implementation
- `PrismaUserRepository` implementation

#### 5.1.3. Set Up Integration Tests

Create integration tests to verify that the new components work correctly with:
- Supabase Auth
- Prisma database

### 5.2. Phase 2: Service Implementation

#### 5.2.1. Implement UserIdentityService

Implement the `UserIdentityService` with all necessary methods:
- `signIn`
- `signUp`
- `signOut`
- etc.

#### 5.2.2. Implement TokenService

Implement a `TokenService` for handling:
- Token validation
- Token refresh
- Token storage

#### 5.2.3. Implement Event Handling

Set up event emitters and listeners for authentication events.

### 5.3. Phase 3: Adapter Pattern Integration

#### 5.3.1. Create Compatibility Layer

Implement adapters that map between:
- Current auth interfaces and new interfaces
- Current user model and new user profile model

#### 5.3.2. Update API Routes

Gradually update API routes to use the new services:
1. Start with non-critical routes
2. Monitor performance and errors
3. Proceed to more critical routes

```typescript
// Example of adapter pattern for API routes
import { userIdentityService } from '@app/auth';
import { legacyAuthService } from './legacy-auth.service';

// Use adapter pattern to make new service compatible with existing routes
export const authAdapter = {
  async login(email: string, password: string) {
    try {
      // Use new service
      const { user, session } = await userIdentityService.signIn(email, password);
      
      // Map to format expected by existing code
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          // Other properties expected by legacy code
        },
        token: session.accessToken,
        refreshToken: session.refreshToken,
      };
    } catch (error) {
      // Fallback to legacy service during transition (optional)
      return legacyAuthService.login(email, password);
    }
  },
  // Other methods...
};
```

### 5.4. Phase 4: Frontend Migration

#### 5.4.1. Implement Frontend SDK

Create a frontend SDK that uses the new auth services:

```typescript
// packages/auth-sdk/src/index.ts
import { AuthCredentials, AuthSession, UserProfile } from '@app/auth';
