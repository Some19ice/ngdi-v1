# @ngdi/api

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
├── index.ts       # Entry point
├── app.ts         # Hono app setup
├── middleware/    # Middleware functions
├── routes/        # API routes
│   ├── auth.ts    # Authentication routes
│   ├── users.ts   # User management routes
│   └── metadata.ts# Metadata routes
├── controllers/   # Route controllers
├── services/      # Business logic
├── models/        # Data models and schema
├── utils/         # Utility functions
├── config/        # Configuration
└── scripts/       # Utility scripts
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout a user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user by ID (admin only)
- `DELETE /api/users/:id` - Delete user by ID (admin only)

### Metadata

- `GET /api/metadata` - Get metadata with pagination and filtering
- `POST /api/metadata` - Create new metadata record
- `GET /api/metadata/:id` - Get metadata record by ID
- `PUT /api/metadata/:id` - Update metadata record by ID
- `DELETE /api/metadata/:id` - Delete metadata record by ID
- `GET /api/metadata/my` - Get current user's metadata

## Technologies Used

- **Hono.js**: API framework
- **Prisma**: ORM for database access
- **Zod**: Schema validation
- **JWT**: Authentication
- **Jest**: Testing framework
- **Winston/Pino**: Logging

## Database

The API uses Prisma ORM to interact with a PostgreSQL database. Schema can be found in the `prisma` directory.

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes to database
npm run prisma:push
```

## Docker Support

The API includes Docker support for containerized deployment:

```bash
# Build Docker image
docker build -t ngdi-api .

# Run container
docker run -p 3001:3001 ngdi-api
```

Or using docker-compose:

```bash
docker-compose up
```

## Deployment

The API is configured for deployment on Vercel.

## License

This project is proprietary and confidential.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables

3. Generate Prisma client:
   ```
   npm run prisma:generate
   ```

4. Push database schema:
   ```
   npm run prisma:push
   ```

5. Seed default users:
   ```
   npm run seed:users
   ```

## Running the API

### Development
```
npm run dev
```

### Production
```
npm run build
npm start
```

## Database Migrations

After database migrations or resets, you may need to reseed the default users:

```
npm run seed:users
```

## Default Users

The seeding script creates the following default users:

1. **Admin User**
   - Email: admin@ngdi.gov.ng
   - Password: Admin123!@#
   - Role: ADMIN

2. **Test User**
   - Email: test@example.com
   - Password: password123
   - Role: USER

3. **Node Officer**
   - Email: nodeofficer@ngdi.gov.ng
   - Password: officer123
   - Role: NODE_OFFICER