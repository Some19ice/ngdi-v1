# Authentication Flow Sequence Diagrams

This document provides detailed sequence diagrams for the authentication flows in the NGDI Portal application.

## Login Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant AuthHook
    participant ReactQuery
    participant SupabaseClient
    participant SupabaseAuth
    participant Cookies
    participant Router

    User->>LoginPage: Enter credentials
    LoginPage->>AuthHook: Call login(email, password, rememberMe)
    AuthHook->>ReactQuery: Start login mutation
    ReactQuery->>SupabaseClient: signInWithPassword(email, password)
    SupabaseClient->>SupabaseAuth: POST /auth/v1/token?grant_type=password
    SupabaseAuth-->>SupabaseClient: Return tokens and user data
    SupabaseClient-->>ReactQuery: Return session data
    ReactQuery->>Cookies: Store tokens in cookies
    ReactQuery->>ReactQuery: Update session query cache
    ReactQuery-->>AuthHook: Return success
    AuthHook->>Router: Navigate to dashboard or redirect URL
    Router-->>LoginPage: Render dashboard
    LoginPage-->>User: Show dashboard
```

## Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant RegisterPage
    participant AuthHook
    participant ReactQuery
    participant SupabaseClient
    participant SupabaseAuth
    participant Email
    participant Router

    User->>RegisterPage: Enter registration details
    RegisterPage->>AuthHook: Call register(email, password, name, ...)
    AuthHook->>ReactQuery: Start registration mutation
    ReactQuery->>SupabaseClient: signUp(email, password, metadata)
    SupabaseClient->>SupabaseAuth: POST /auth/v1/signup
    SupabaseAuth->>SupabaseAuth: Create user account
    SupabaseAuth->>Email: Send verification email
    SupabaseAuth-->>SupabaseClient: Return user data
    SupabaseClient-->>ReactQuery: Return registration result
    ReactQuery-->>AuthHook: Return success
    AuthHook->>Router: Navigate to verification page
    Router-->>RegisterPage: Render verification page
    RegisterPage-->>User: Show verification instructions
    
    Note over User,Email: User checks email
    
    User->>Email: Open verification email
    User->>Email: Click verification link
    Email->>SupabaseAuth: GET /auth/v1/verify
    SupabaseAuth->>SupabaseAuth: Verify email
    SupabaseAuth-->>Router: Redirect to callback URL
    Router->>SupabaseClient: Exchange token for session
    SupabaseClient->>SupabaseAuth: POST /auth/v1/token?grant_type=recovery
    SupabaseAuth-->>SupabaseClient: Return session data
    SupabaseClient-->>Router: Return to app with session
    Router-->>User: Show dashboard
```

## Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant AuthHook
    participant ReactQuery
    participant SupabaseClient
    participant SupabaseAuth
    participant Cookies
    participant Router

    User->>Component: Click logout button
    Component->>AuthHook: Call logout()
    AuthHook->>ReactQuery: Start logout mutation
    ReactQuery->>SupabaseClient: signOut()
    SupabaseClient->>SupabaseAuth: POST /auth/v1/logout
    SupabaseAuth-->>SupabaseClient: Logout success
    SupabaseClient-->>ReactQuery: Return success
    ReactQuery->>Cookies: Clear auth cookies
    ReactQuery->>ReactQuery: Clear session query cache
    ReactQuery-->>AuthHook: Return success
    AuthHook->>Router: Navigate to home page
    Router-->>Component: Render home page
    Component-->>User: Show home page
```

## Session Refresh Flow

```mermaid
sequenceDiagram
    participant AuthHook
    participant ReactQuery
    participant SupabaseClient
    participant SupabaseAuth
    participant Cookies

    Note over AuthHook,Cookies: Session refresh can be triggered by:
    Note over AuthHook,Cookies: 1. Scheduled refresh
    Note over AuthHook,Cookies: 2. Window focus
    Note over AuthHook,Cookies: 3. Network reconnect
    
    AuthHook->>ReactQuery: Trigger session refresh
    ReactQuery->>SupabaseClient: refreshSession()
    SupabaseClient->>Cookies: Get refresh token
    Cookies-->>SupabaseClient: Return refresh token
    SupabaseClient->>SupabaseAuth: POST /auth/v1/token?grant_type=refresh_token
    SupabaseAuth->>SupabaseAuth: Validate refresh token
    SupabaseAuth-->>SupabaseClient: Return new tokens
    SupabaseClient->>Cookies: Update tokens in cookies
    SupabaseClient-->>ReactQuery: Return updated session
    ReactQuery->>ReactQuery: Update session query cache
    ReactQuery-->>AuthHook: Return success
```

## Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant ResetPage
    participant AuthHook
    participant ReactQuery
    participant SupabaseClient
    participant SupabaseAuth
    participant Email
    participant Router

    User->>ResetPage: Enter email address
    ResetPage->>AuthHook: Call resetPassword(email)
    AuthHook->>ReactQuery: Start reset mutation
    ReactQuery->>SupabaseClient: resetPasswordForEmail(email)
    SupabaseClient->>SupabaseAuth: POST /auth/v1/recover
    SupabaseAuth->>SupabaseAuth: Generate reset token
    SupabaseAuth->>Email: Send reset email
    SupabaseAuth-->>SupabaseClient: Return success
    SupabaseClient-->>ReactQuery: Return success
    ReactQuery-->>AuthHook: Return success
    AuthHook->>Router: Navigate to check email page
    Router-->>ResetPage: Render check email page
    ResetPage-->>User: Show check email instructions
    
    Note over User,Email: User checks email
    
    User->>Email: Open reset email
    User->>Email: Click reset link
    Email->>SupabaseAuth: GET /auth/v1/verify
    SupabaseAuth->>SupabaseAuth: Verify token
    SupabaseAuth-->>Router: Redirect to update password page
    Router-->>User: Show update password form
    
    User->>ResetPage: Enter new password
    ResetPage->>AuthHook: Call updatePassword(password)
    AuthHook->>ReactQuery: Start update mutation
    ReactQuery->>SupabaseClient: updateUser({ password })
    SupabaseClient->>SupabaseAuth: PUT /auth/v1/user
    SupabaseAuth->>SupabaseAuth: Update password
    SupabaseAuth-->>SupabaseClient: Return success
    SupabaseClient-->>ReactQuery: Return success
    ReactQuery-->>AuthHook: Return success
    AuthHook->>Router: Navigate to login page
    Router-->>ResetPage: Render login page
    ResetPage-->>User: Show password updated message
```

## Protected Route Flow

```mermaid
sequenceDiagram
    participant User
    participant Router
    participant Middleware
    participant SupabaseClient
    participant SupabaseAuth
    participant Cookies
    participant ProtectedPage

    User->>Router: Navigate to protected route
    Router->>Middleware: Check route protection
    Middleware->>Cookies: Get auth tokens
    Cookies-->>Middleware: Return tokens
    
    alt No tokens found
        Middleware->>Router: Redirect to login page
        Router-->>User: Show login page
    else Tokens found
        Middleware->>SupabaseClient: getSession()
        SupabaseClient->>SupabaseAuth: GET /auth/v1/token
        SupabaseAuth->>SupabaseAuth: Validate token
        SupabaseAuth-->>SupabaseClient: Return session data
        SupabaseClient-->>Middleware: Return session
        
        alt Invalid or expired session
            Middleware->>Router: Redirect to login page
            Router-->>User: Show login page
        else Valid session
            alt Role check fails
                Middleware->>Router: Redirect to unauthorized page
                Router-->>User: Show unauthorized page
            else Role check passes
                Middleware->>Router: Allow navigation
                Router->>ProtectedPage: Render protected page
                ProtectedPage-->>User: Show protected content
            end
        end
    end
```

## Token Refresh on API Request Flow

```mermaid
sequenceDiagram
    participant Component
    participant ApiClient
    participant AuthHook
    participant SupabaseClient
    participant API
    participant SupabaseAuth

    Component->>ApiClient: Make API request
    ApiClient->>AuthHook: Get current session
    AuthHook-->>ApiClient: Return session with tokens
    
    alt Token is about to expire
        ApiClient->>SupabaseClient: refreshSession()
        SupabaseClient->>SupabaseAuth: POST /auth/v1/token?grant_type=refresh_token
        SupabaseAuth-->>SupabaseClient: Return new tokens
        SupabaseClient-->>ApiClient: Return updated tokens
    end
    
    ApiClient->>API: Send request with auth token
    API->>SupabaseAuth: Validate token
    SupabaseAuth-->>API: Token validation result
    
    alt Token is invalid
        API-->>ApiClient: Return 401 Unauthorized
        ApiClient->>AuthHook: Handle auth error
        AuthHook->>Component: Show auth error
    else Token is valid
        API-->>ApiClient: Return API response
        ApiClient-->>Component: Return API data
    end
```

## Error Handling Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant AuthHook
    participant ReactQuery
    participant SupabaseClient
    participant SupabaseAuth
    participant ErrorHandler
    participant Toast

    User->>Component: Perform auth action
    Component->>AuthHook: Call auth method
    AuthHook->>ReactQuery: Execute query/mutation
    ReactQuery->>SupabaseClient: Call Supabase method
    SupabaseClient->>SupabaseAuth: Send auth request
    
    alt Auth error occurs
        SupabaseAuth-->>SupabaseClient: Return error response
        SupabaseClient-->>ReactQuery: Throw error
        ReactQuery->>ErrorHandler: Process error
        ErrorHandler->>ErrorHandler: Map error to user-friendly message
        ErrorHandler->>Toast: Show error toast
        Toast-->>User: Display error message
        
        alt Recoverable error
            ErrorHandler->>Component: Return error for handling
            Component->>User: Show recovery UI
        else Critical error
            ErrorHandler->>AuthHook: Reset auth state
            AuthHook->>Component: Redirect to error page
            Component-->>User: Show error page
        end
    else Success
        SupabaseAuth-->>SupabaseClient: Return success response
        SupabaseClient-->>ReactQuery: Return result
        ReactQuery-->>AuthHook: Return success
        AuthHook-->>Component: Return success
        Component-->>User: Show success UI
    end
```
