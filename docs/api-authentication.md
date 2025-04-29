# API Authentication Documentation

This document provides detailed information about the authentication system used in the NGDI Portal API.

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Token Format](#token-format)
4. [API Endpoints](#api-endpoints)
5. [Making Authenticated Requests](#making-authenticated-requests)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)
8. [Examples](#examples)

## Overview

The NGDI Portal API uses Supabase Auth for authentication, which provides JWT-based authentication. All protected API endpoints require a valid JWT token in the Authorization header.

### Key Features

- **JWT-Based Authentication**: Secure, stateless authentication using JWT tokens
- **Role-Based Access Control**: Different endpoints require different user roles
- **Token Validation**: Comprehensive token validation on the server
- **Automatic Token Refresh**: Client-side token refresh when tokens expire
- **Secure Token Storage**: Tokens are stored securely in HTTP-only cookies

## Authentication Flow

1. **Login**: User logs in through the frontend, which obtains tokens from Supabase Auth
2. **Token Storage**: Tokens are stored securely in cookies
3. **API Requests**: Frontend includes the access token in the Authorization header
4. **Token Validation**: API validates the token with Supabase Auth
5. **Response**: If the token is valid, the API processes the request and returns a response
6. **Token Refresh**: When the token is about to expire, the frontend refreshes it automatically

## Token Format

### JWT Structure

The JWT token used for authentication has the following structure:

```
header.payload.signature
```

### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload

```json
{
  "aud": "authenticated",
  "exp": 1619191919,
  "sub": "user-id",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1619188319
}
```

Key fields:
- `aud`: Audience (always "authenticated")
- `exp`: Expiration timestamp
- `sub`: Subject (user ID)
- `email`: User's email
- `role`: User's role
- `iat`: Issued at timestamp

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|------------------------|
| `/api/auth/login` | POST | Log in with email and password | No |
| `/api/auth/register` | POST | Register a new user | No |
| `/api/auth/logout` | POST | Log out the current user | Yes |
| `/api/auth/refresh` | POST | Refresh the access token | Yes (Refresh Token) |
| `/api/auth/me` | GET | Get the current user's profile | Yes |
| `/api/auth/reset-password` | POST | Request a password reset | No |
| `/api/auth/update-password` | POST | Update the user's password | Yes |
| `/api/auth/verify-email` | GET | Verify the user's email | No (Token in URL) |

### Protected Endpoints

All other API endpoints require authentication. Some endpoints also require specific roles:

| Role | Endpoints |
|------|-----------|
| `ADMIN` | `/api/admin/*`, `/api/users/*` |
| `NODE_OFFICER` | `/api/metadata/create`, `/api/metadata/edit/*` |
| `USER` | `/api/metadata/view/*`, `/api/profile/*` |

## Making Authenticated Requests

### Request Headers

To make an authenticated request, include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Example Request

```javascript
const response = await fetch('https://api.ngdi.gov.ng/api/metadata/view/123', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Using the API Client

The NGDI Portal provides an API client that handles authentication automatically:

```javascript
import { apiClient } from '@/lib/api-client';

// The client automatically includes the auth token
const { data } = await apiClient.get('/metadata/view/123');
```

## Error Handling

### Authentication Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `auth/invalid-token` | The token is invalid or malformed |
| 401 | `auth/expired-token` | The token has expired |
| 401 | `auth/missing-token` | No token was provided |
| 403 | `auth/insufficient-permissions` | The user doesn't have the required permissions |
| 429 | `auth/rate-limited` | Too many requests (rate limited) |

### Error Response Format

```json
{
  "error": {
    "code": "auth/invalid-token",
    "message": "Invalid authentication token",
    "status": 401
  }
}
```

### Handling Token Expiration

When a token expires, the API returns a 401 error with the code `auth/expired-token`. The client should:

1. Attempt to refresh the token using the refresh token
2. Retry the original request with the new token
3. If the refresh fails, redirect the user to the login page

## Security Considerations

### Token Storage

- **Access Token**: Short-lived (24 hours), stored in memory or secure cookie
- **Refresh Token**: Longer-lived (7 days), stored in HTTP-only cookie

### CSRF Protection

- Use CSRF tokens for sensitive operations
- Set SameSite=Strict for cookies in production

### Rate Limiting

- API endpoints are rate-limited to prevent abuse
- Authentication endpoints have stricter rate limits

### Token Validation

- Tokens are validated on every request
- Validation includes checking expiration, signature, and revocation status

## Examples

### Authentication with Fetch API

```javascript
// Login
async function login(email, password) {
  const response = await fetch('https://api.ngdi.gov.ng/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error.message);
  }
  
  // Store tokens securely
  localStorage.setItem('accessToken', data.accessToken);
  
  return data;
}

// Make authenticated request
async function fetchProtectedData() {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('https://api.ngdi.gov.ng/api/metadata/view/123', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      return fetchProtectedData();
    }
    
    throw new Error(data.error.message);
  }
  
  return data;
}

// Refresh token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch('https://api.ngdi.gov.ng/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw new Error(data.error.message);
  }
  
  // Update tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  
  return data;
}
```

### Authentication with API Client

```javascript
import { createApiClient } from '@/lib/api-client';

// Create API client
const apiClient = createApiClient({
  baseURL: 'https://api.ngdi.gov.ng/api',
  onAuthError: (error) => {
    // Handle auth errors
    if (error.code === 'auth/expired-token') {
      // Token expired, refresh and retry
      return apiClient.refreshToken();
    }
    
    // Other auth errors
    window.location.href = '/login';
  }
});

// Login
async function login(email, password) {
  try {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Fetch protected data
async function fetchProtectedData() {
  try {
    const { data } = await apiClient.get('/metadata/view/123');
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

### Role-Based Access Control

```javascript
import { apiClient } from '@/lib/api-client';
import { useAuthSession } from '@/hooks/use-auth-session';

function AdminPanel() {
  const { isAdmin } = useAuthSession();
  
  async function fetchAdminData() {
    if (!isAdmin()) {
      throw new Error('Not authorized');
    }
    
    try {
      const { data } = await apiClient.get('/admin/dashboard');
      return data;
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      throw error;
    }
  }
  
  // Component implementation
}
```
