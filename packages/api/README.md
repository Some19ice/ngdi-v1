# NGDI Portal Backend API

This is the backend API for the NGDI Portal, built with Hono.js.

## Overview

The API is built using Hono.js, a lightweight, fast, and modern web framework for the edge. It provides RESTful endpoints for authentication, user management, and metadata operations.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **User Management**: User registration, profile management, and role-based access control
- **Metadata Management**: CRUD operations for metadata
- **OpenAPI Documentation**: Auto-generated API documentation using Swagger UI
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Consistent error responses
- **Logging**: Request logging for debugging and monitoring

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test
```

## API Documentation

The API documentation is available at `/docs` when the server is running.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ngdi

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
EMAIL_FROM=noreply@example.com
```

## Project Structure

```
src/
├── config/       # Configuration files
├── db/           # Database connection and models
├── lib/          # Utility functions and libraries
├── middleware/   # Middleware functions
├── routes/       # API routes
├── services/     # Business logic
├── tests/        # Tests
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
└── index.ts      # Entry point
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout a user

### Users

- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

### Metadata

- `GET /api/metadata` - Get all metadata
- `POST /api/metadata` - Create new metadata
- `GET /api/metadata/:id` - Get metadata by ID
- `PUT /api/metadata/:id` - Update metadata by ID
- `DELETE /api/metadata/:id` - Delete metadata by ID

## License

This project is proprietary and confidential. 