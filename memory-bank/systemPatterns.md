# System Patterns: NGDI Portal

## System Architecture
The NGDI Portal follows a modern web application architecture with the following key components:

1. **Frontend**
   - Next.js 14 with App Router for server components and client components
   - React 18 for UI components with TypeScript
   - Tailwind CSS for styling with class-variance-authority for component variants
   - React Context Providers for state management
   - React Query for server state management and caching

2. **Backend**
   - Hono.js for API server implementation in a monorepo package
   - JWT-based authentication with token validation
   - Typed API routes with Zod schema validation
   - Middleware for request validation and authentication

3. **Database**
   - PostgreSQL as the primary database
   - Prisma ORM for database access, migrations, and type-safe queries
   - Complex schema with relationships between users, metadata, and other entities

4. **Authentication**
   - Supabase Auth for user authentication services
   - Custom JWT token validation in middleware
   - Role-based access control (USER, ADMIN, NODE_OFFICER)
   - Session management with refreshing capabilities

5. **Deployment**
   - Vercel for frontend and API deployment
   - Docker support for containerized deployment
   - Environment-specific configurations (.env.local, .env.production)

## Key Technical Decisions

1. **Next.js App Router**: Using Next.js App Router for improved routing, layouts, server components, and SEO benefits.

2. **Monorepo Structure**: Organizing the codebase as a monorepo with workspaces:
   - Frontend (Next.js) in the root directory
   - API server in packages/api using Hono.js
   - Shared types and utilities across frontend and backend

3. **Component Library**: Comprehensive use of Radix UI components for accessibility and customization, enhanced with Tailwind CSS.

4. **Mapping Technologies**: Supporting multiple mapping libraries (Leaflet, OpenLayers, Mapbox GL) with components designed to accommodate different mapping needs.

5. **API Design**: Implementing a RESTful API using Hono.js with:
   - Route grouping by feature (auth, metadata, users, search)
   - Request validation with Zod schemas
   - Error handling middleware
   - Authentication middleware

6. **Testing Strategy**: 
   - Playwright for frontend E2E testing with UI testing support
   - Jest for API unit and integration testing
   - Common test utilities and fixtures

7. **Authentication Flow**: 
   - JWT-based authentication with token validation in middleware
   - Token caching for performance optimization
   - Session refreshing mechanism
   - Role-based route protection

## Design Patterns

1. **Component-Based Architecture**: UI elements built as reusable React components organized by feature in the components directory.

2. **Server Components**: Leveraging Next.js 14 server components for database access and server-side operations, improving performance and SEO.

3. **Custom Hooks**: Extensive use of React custom hooks for reusable logic:
   - Authentication hooks (useAuth)
   - Form handling hooks
   - Data fetching hooks with React Query
   - Map-related hooks

4. **Context Providers**: Implementing React Context for state management:
   - Authentication context
   - Theme context
   - Toast notification context
   - Other application-specific contexts

5. **Middleware Pattern**: Using Next.js middleware for authentication, routing logic, and request validation.

6. **Repository Pattern**: API services organized around data entities with clear separation of concerns.

7. **Feature-Based Organization**: Both frontend and backend code organized by feature rather than technical role.

8. **Composition Pattern**: UI components composed from smaller, reusable components following the Atomic Design methodology.

9. **Form Abstraction**: Form handling abstracted with React Hook Form and Zod validation schemas.

## Component Relationships

1. **UI Components**: Extensive library of reusable UI components in components/ui/ forming the foundation for feature-specific components.

2. **Feature Organization**: Components organized by feature with clear modules for:
   - Authentication (auth/)
   - Metadata management (metadata/)
   - Map visualization (map/)
   - Search functionality (search/)
   - Administration (admin/)
   - User profile (profile/)

3. **Page Structure**: Pages built using components with the Next.js App Router structure:
   - layout.tsx files for shared layouts
   - page.tsx files for route components
   - loading.tsx for loading states
   - error.tsx for error handling

4. **API Integration**: Frontend components connect to the backend API using:
   - React Query for data fetching and caching
   - Custom hooks for API calls
   - Server actions for server-side operations

5. **Authentication Flow**:
   - Auth components interact with Supabase Auth
   - JWT tokens stored in cookies
   - Middleware validates tokens for protected routes
   - Session refreshing mechanism in session-refresher.tsx

6. **Data Flow**: The typical data flow follows:
   - UI Component → Custom Hook → React Query → API Client → API Server → Prisma → Database
   - Database → Prisma → API Server → API Client → React Query → UI Component

7. **Map Integration**: Map components with different visualization strategies:
   - Support for multiple libraries (Leaflet, OpenLayers, Mapbox GL)
   - Integration with metadata for geospatial visualization
   - Custom hooks for map interaction

8. **Metadata Management**:
   - Complex metadata model following NGDI standards
   - Form-based editing with multi-step workflows
   - Search functionality with advanced filtering
   - Visualization options through maps and charts 