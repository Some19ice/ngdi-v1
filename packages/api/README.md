# NGDI Portal Backend

This is the backend API for the NGDI Portal, built with Hono, a lightweight, fast, and modern web framework for the edge.

## Features

- RESTful API with TypeScript support
- JWT-based authentication and authorization
- Role-based access control
- Prisma ORM for database access
- Zod for request validation
- Swagger/OpenAPI documentation
- Rate limiting
- Comprehensive error handling
- Unit, integration, and end-to-end testing

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the example environment variables:
   ```bash
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration
6. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

### Development

Start the development server:

```bash
npm run dev
```

The server will be available at http://localhost:3001 (or the port specified in your .env file).

### Building for Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Testing

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## API Documentation

When the server is running, you can access the Swagger documentation at:

```
http://localhost:3001/docs
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/                  # Configuration files
│   ├── middleware/              # Middleware functions
│   ├── routes/                  # API routes
│   ├── services/                # Business logic
│   ├── db/                      # Database access
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript type definitions
├── prisma/                      # Prisma ORM
├── tests/                       # Tests
├── .env                         # Environment variables
└── package.json                 # Dependencies and scripts
```

## License

This project is proprietary and confidential. 