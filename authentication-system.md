# Authentication System Documentation for NGDI Portal

## Overview

The NGDI Portal implements a comprehensive authentication system with a JWT-based approach, handling user login, registration, session management, and token refresh. The system is built as part of a monorepo structure with a Next.js frontend and a separate API server using Hono.js.

## File Structure

```
├── app/
│   ├── auth/
│   │   ├── signin/
│   │   │   ├── page.tsx
│   │   │   └── signin-content.tsx
│   │   ├── callback/
│   │   │   └── route.ts
│   │   ├── reset-password/
│   │   └── new-user/
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-content.tsx
│   └── register/
│       └── page.tsx
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── session-refresher.tsx
├── hooks/
│   └── use-auth-session.ts
├── lib/
│   ├── auth-client.ts
│   ├── auth/
│   │   ├── constants.ts
│   │   ├── paths.ts
│   │   └── validation.ts
│   └── utils/
│       ├── cookie-utils.ts
│       └── csrf-utils.ts
├── middleware.ts
├── packages/
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   └── auth/
│       │   │       └── index.ts
│       │   ├── services/
│       │   │   └── auth.service.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── rate-limit.middleware.ts
│       │   ├── utils/
│       │   │   ├── jwt.ts
│       │   │   ├── cookie.utils.ts
│       │   │   └── token-validation.ts
│       │   └── types/
│       │       ├── auth.types.ts
│       │       └── error.types.ts
│       └── vercel.json
├── types/
│   ├── auth.ts
│   └── user.ts
└── vercel.json
```

## Key Components

### Frontend Authentication

#### 1. `lib/auth-client.ts`

This is the central client-side utility for handling authentication. Key features:

- JWT token validation and caching
- Login, logout, and registration functionality
- Session management and token refresh
- Cookie handling for auth tokens
- Direct API communication with the backend

The auth client implements several methods:
- `login()` - Authenticates users with credentials
- `logout()` - Clears auth tokens and calls logout API
- `refreshToken()` - Handles token refreshing
- `getSession()` - Retrieves the current user session
- `isAuthenticated()` - Checks if user is authenticated
- `validateToken()` - Validates JWT tokens locally

It also handles API URL management, supporting both development and production environments:
```typescript
// Helper function to get the correct auth endpoint
function getAuthEndpoint(path: string): string {
  // For local development, use localhost directly
  if (process.env.NODE_ENV !== "production") {
    return `http://localhost:3001/api/auth/${path}`
  }

  // For production, use the direct API URL
  return `https://ngdi-v1.vercel.app/api/auth/${path}`
}
```

#### 2. `hooks/use-auth-session.ts`

A React hook that provides authentication context throughout the application:
- Uses React Query for caching and managing auth state
- Handles login, logout, and session refresh operations
- Manages loading states and error handling
- Implements navigation after auth state changes

#### 3. `middleware.ts`

Next.js middleware that:
- Protects routes that require authentication
- Validates JWT tokens on server-side
- Redirects unauthenticated users to login
- Handles role-based access control
- Sets user headers for downstream components

#### 4. `components/auth/login-form.tsx`

A React component that:
- Implements the login form UI
- Handles form validation using Zod
- Manages login state and error display
- Uses the auth session hook for authentication

#### 5. `lib/auth/paths.ts`

Defines centralized constants for authentication routes:
```typescript
export const AUTH_PATHS = {
  SIGNIN: "/auth/signin",
  CALLBACK: "/auth/callback",
  RESET_PASSWORD: "/auth/reset-password",
  NEW_USER: "/auth/new-user",
  UNAUTHORIZED: "/unauthorized",
}

export const PROTECTED_ROUTES = [...]
export const ADMIN_ROUTES = [...]
export const NODE_OFFICER_ROUTES = [...]
```

#### 6. `lib/utils/cookie-utils.ts`

Utilities for cookie management:
- Setting, getting, and deleting cookies
- Cross-domain cookie handling
- Cookie detection and validation

### Backend Authentication

#### 1. `packages/api/src/routes/auth.routes.ts`

The main authentication API routes handler:
- Login and registration endpoints
- Password reset and email verification
- Token refresh mechanism
- Logout functionality

Implements routes like:
```typescript
// Login route
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  // Implementation...
})

// Register route
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  // Implementation...
})

// Refresh token route
auth.post("/refresh-token", async (c) => {
  // Implementation...
})
```

#### 2. `packages/api/src/services/auth.service.ts`

Service layer for authentication business logic:
- User authentication with credentials
- Token generation and validation
- User registration and verification
- Password management

#### 3. `packages/api/src/utils/jwt.ts`

JWT token utilities:
- Token generation and signing
- Verification and validation
- Refresh token handling

#### 4. `packages/api/src/middleware/auth.ts`

Middleware for protecting API routes:
- Token validation
- Role-based permissions
- Request authentication

#### 5. `packages/api/src/utils/cookie.utils.ts`

Server-side cookie handling:
- Setting cookies with appropriate options
- Cross-domain cookie support
- Security configurations

## Deployment Configuration

### 1. `vercel.json` (Frontend)

Configures the frontend deployment:
- Build settings
- Headers for auth routes
- No API rewrites (direct API calls)

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "regions": ["cle1"],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/auth/:path*",
      "headers": [{ "key": "Cache-Control", "value": "no-store, max-age=0" }]
    }
  ]
}
```

### 2. `packages/api/vercel.json` (API Server)

Configures the API server deployment:
- Route configurations
- CORS headers for frontend access
- Node.js handler settings

```json
{
  "version": 2,
  "name": "ngdi-api",
  "builds": [...],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "https://ngdi-v1.vercel.app" },
        ...
      ]
    }
  ]
}
```

## Authentication Flow

1. **Login Process**:
   - User submits credentials via login form
   - Frontend sends credentials to `/api/auth/login`
   - Backend validates credentials and generates tokens
   - Tokens are returned and stored as cookies
   - Frontend updates authentication state

2. **Authentication Verification**:
   - `middleware.ts` checks protected routes
   - JWT tokens validated on server-side
   - Unauthenticated users redirected to login

3. **Token Refresh**:
   - Expired tokens automatically refreshed
   - Refresh tokens used to obtain new access tokens
   - Auth state maintained across page refreshes

4. **Logout**:
   - Cookies cleared on the client
   - Backend notified to invalidate tokens
   - User redirected to login or home page

## Security Considerations

- JWT tokens with proper expiration
- CSRF protection for auth requests
- Rate limiting on authentication endpoints
- Secure cookie handling with appropriate flags
- Input validation using Zod schemas
- Cross-origin resource sharing (CORS) controls

## Production Configuration

For production, the authentication system:
- Uses direct API calls to `https://ngdi-v1.vercel.app/api/*`
- Sets appropriate CORS headers for cross-origin requests
- Configures cookies for secure transmission
- Implements proper domain handling for cookies

## Recent Changes

- Replaced external API URL with same-domain URL
- Updated cookie handling to work with same-domain approach
- Simplified API routing without rewrites
- Fixed CORS configuration for proper authentication 