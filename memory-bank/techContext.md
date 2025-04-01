# Technical Context: NGDI Portal

## Technologies Used

### Frontend
- **Next.js 14**: React framework with App Router for server and client components
- **React 18**: UI library for component-based development
- **TypeScript**: Strongly typed JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Comprehensive set of headless UI components for accessibility and customization
- **React Hook Form**: Form handling library with Zod schema validation
- **React Query (Tanstack Query)**: Data fetching, caching, and state management library
- **Leaflet/OpenLayers/Mapbox GL**: Multiple map visualization libraries for different needs
- **Recharts**: Chart visualization library for data representation
- **Next Themes**: Theme switching functionality (dark/light mode)
- **Embla Carousel**: Carousel component for image galleries
- **Lucide React**: Icon library
- **Sonner**: Toast notification library

### Backend
- **Hono.js**: Lightweight, high-performance API framework
- **Prisma ORM**: Database ORM for type-safe database access and migrations
- **JWT/Jose**: JSON Web Tokens for authentication and session management
- **Supabase Auth**: Authentication service for user management
- **Nodemailer**: Email service for notifications and password resets
- **Bcrypt**: Password hashing library
- **Upstash/Redis**: Rate limiting implementation
- **Zod**: Schema validation for API request/response

### Database
- **PostgreSQL**: Primary database (used with Supabase and Prisma)
- **Prisma**: ORM and migration tool for type-safe database access
- **Supabase**: Provides Auth and database services

### Testing
- **Playwright**: End-to-end testing for frontend with UI testing capabilities
- **Jest**: Unit and integration testing for API
- **Testing Library**: React component testing utilities
- **axe-core/playwright**: Accessibility testing

### DevOps
- **Docker**: Containerization for the API server
- **Vercel**: Deployment platform for the application
- **Concurrently**: Tool for running multiple npm scripts simultaneously

## Development Setup

1. **Node.js Requirements**: Node.js >=18.0.0
2. **Package Management**: npm with workspaces for monorepo structure
3. **Environment Variables**: 
   - `.env.local` for frontend development
   - `.env` for shared variables
   - `.env.production` for production settings
   - `packages/api/.env` for API server
4. **Development Workflow**:
   - `npm run dev`: Start both frontend and API servers concurrently
   - `npm run build`: Build both frontend and API for production
   - `npm run test`: Run all tests (frontend and API)
   - `npm run db:push`: Apply database schema changes
   - `npm run db:init`: Initialize database

## Technical Constraints

1. **Node.js Version**: Minimum Node.js 18.0.0 required
2. **Monorepo Structure**: Frontend and API are in a single repository with workspaces
3. **Authentication**: Depends on Supabase Auth and custom JWT validation
4. **Authorization**: Role-based access control (USER, ADMIN, NODE_OFFICER roles)
5. **API Rate Limiting**: Implemented using @upstash/ratelimit and Redis
6. **Database Schema**: Defined by Prisma schema with complex metadata model
7. **Protected Routes**: Controlled via middleware for authentication validation
8. **Deployment**: Configured for Vercel deployment with custom build scripts
9. **Testing Requirements**: Tests must pass before deployment

## Dependencies

### Core Dependencies
The project has an extensive set of dependencies including:
- Full Radix UI ecosystem for UI components
- Multiple mapping libraries (Leaflet, OpenLayers, Mapbox GL)
- Data fetching with Axios and React Query
- Form handling with React Hook Form and Zod
- Date handling with date-fns
- Authentication with Supabase Auth and JWT
- Visualization with Recharts and mapping libraries
- Database access with Prisma ORM

### Development Dependencies
- TypeScript and type definitions for all libraries
- Testing frameworks (Playwright, Jest)
- ESLint and Prettier for code formatting and quality
- Concurrently for parallel development processes
- Prisma for database management
- Supabase CLI for Supabase integration

## Integration Points

1. **Supabase**: Authentication services and database storage
2. **Email Services**: Via Nodemailer for notifications and password resets
3. **API Integration**: Communication between frontend and backend via Hono.js
4. **Redis**: Rate limiting via Upstash
5. **Map Providers**: Integration with multiple mapping services
6. **External APIs**: Potential integration with external geospatial data services

## Performance Considerations

1. **Server Components**: Leveraging Next.js 14 server components for better performance
2. **Data Caching**: Using React Query for efficient data caching and state management
3. **API Efficiency**: Lightweight Hono.js for API performance
4. **Token Validation**: Caching token validation results to reduce authentication overhead
5. **Database Queries**: Using Prisma for optimized database access 