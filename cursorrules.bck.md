
  You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.
  
  Code Style and Structure
  - Write concise, technical TypeScript code with accurate examples.
  - Use functional and declarative programming patterns; avoid classes.
  - Prefer iteration and modularization over code duplication.
  - Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
  - Structure files: exported component, subcomponents, helpers, static content, types.
  
  Naming Conventions
  - Use lowercase with dashes for directories (e.g., components/auth-wizard).
  - Favor named exports for components.
  
  TypeScript Usage
  - Use TypeScript for all code; prefer interfaces over types.
  - Avoid enums; use maps instead.
  - Use functional components with TypeScript interfaces.
  
  Syntax and Formatting
  - Use the "function" keyword for pure functions.
  - Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
  - Use declarative JSX.
  
  UI and Styling
  - Use Shadcn UI, Radix, and Tailwind for components and styling.
  - Implement responsive design with Tailwind CSS; use a mobile-first approach.
  
  Performance Optimization
  - Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
  - Wrap client components in Suspense with fallback.
  - Use dynamic loading for non-critical components.
  - Optimize images: use WebP format, include size data, implement lazy loading.
  
  Key Conventions
  - Use 'nuqs' for URL search parameter state management.
  - Optimize Web Vitals (LCP, CLS, FID).
  - Limit 'use client':
    - Favor server components and Next.js SSR.
    - Use only for Web API access in small components.
    - Avoid for data fetching or state management.
  
  Follow Next.js docs for Data Fetching, Rendering, and Routing.

  #Git Usage

  use the following prefixes for commit messages followed by a colon and a space:
  "fix" for bug fixes
  "feat" for new features
  "perf" for performance improvements
  "docs" for documentation changes
  "style" for formatting changes
  "refactor" for code refactoring
  "test" for adding missing tests
  "chore" for chore tasks
  when determining the commit message prefix, pick the most relevant prefix from the list above
  use lower case for commit messages
  the commit message should also include a list of the changes made in the commit after the summary line if the changes are not self explanatory

  #Extra

  Before editing a file, read it first.

  # TypeScript Standards
  - Use TypeScript for all code; prefer interfaces over types for better extension.
  - Avoid enums; use const objects with "as const" for type-safe maps.
  - Use functional React components with explicit interface definitions for props.
  - Always provide proper type definitions for state, context, and hooks.
  - Use TypeScript utility types (Partial, Pick, Omit, etc.) when appropriate.
  - Ensure strict type checking with no "any" types unless absolutely necessary.

  # React Component Guidelines
  - Use functional components exclusively; avoid class components.
  - Structure components in order: 
    1. Exported component
    2. Subcomponents (if applicable)
    3. Helper functions
    4. Static content
    5. Type definitions
  - Use the "function" keyword for component and utility function declarations.
  - Destructure props in function parameters.
  - Minimize "use client" directives; prefer React Server Components where possible.
  - Use Suspense boundaries with appropriate fallbacks for client components.
  - Implement dynamic imports for non-critical components.
  - Use Context API for shared state only when necessary.
  - Prefer composition over prop drilling for complex component hierarchies.

  # Next.js App Router
  - Follow the App Router conventions for routing and layout organization.
  - Use the `page.tsx` convention for route definitions.
  - Place reusable components in `/components` directory, not in `/app` route folders.
  - Leverage `layout.tsx` for shared UI around routes.
  - Use appropriate metadata API for SEO optimization.
  - Implement server actions for form submissions and data mutations.
  - Keep data fetching close to where it's used (usually in page components).
  - Ensure proper error handling with `error.tsx` boundaries.
  - Use loading states with `loading.tsx` for route transitions.
  - Leverage Next.js image optimization for all images.

  # UI and Styling
  - Use Shadcn UI components from the `/components/ui` directory.
  - Implement Tailwind CSS for styling; follow utility-first approach.
  - Maintain mobile-first responsive design using Tailwind breakpoints.
  - Use Radix UI primitives for complex interactive components.
  - Follow the project's component naming conventions.
  - Style components using cn() utility from `lib/utils.ts`.
  - Use CSS variables for theming defined in `app/globals.css`.
  - Optimize images: use WebP format, specify dimensions, implement lazy loading.
  - Use consistent spacing, colors, and typography from the design system.

  # Performance Optimization
  - Minimize client-side JavaScript by using server components where possible.
  - Use React Query for data fetching and caching.
  - Implement proper Suspense boundaries for asynchronous operations.
  - Leverage Next.js built-in optimizations for images, fonts, and scripts.
  - Optimize Core Web Vitals: LCP, CLS, FID/INP.
  - Avoid unnecessary re-renders with proper use of memoization.
  - Implement code splitting with dynamic imports for large components.
  - Use server actions for form submissions and data mutations.
  - Handle API rate limiting appropriately.
  - Follow the principles of progressive enhancement.

  # Project Architecture
  - Maintain clear separation of concerns between UI, business logic, and data access.
  - Place reusable utility functions in `/lib` directory.
  - Store React hooks in `/hooks` directory.
  - Keep API client code in `/lib/api` or `/lib/services`.
  - Manage authentication logic in `/lib/auth`.
  - Place database access code in `/lib/server` for server-only operations.
  - Follow the backend microservices approach with packages directory.
  - Use Prisma for database operations.
  - Implement proper error handling and logging.
  - Write tests for critical business logic.

  # API Server (packages/api)
  - Use Hono.js for API routes and middleware.
  - Follow RESTful API design principles.
  - Implement route validation using Zod and @hono/zod-validator.
  - Structure the API server with clear separation:
    - `/routes`: API endpoint definitions
    - `/services`: Business logic
    - `/middleware`: Request processing middleware
    - `/utils`: Helper functions
    - `/db`: Database access layer
    - `/config`: Environment configuration
    - `/types`: TypeScript type definitions
  - Use Prisma for database operations within services.
  - Implement comprehensive error handling with appropriate HTTP status codes.
  - Include request validation before processing.
  - Document API endpoints with OpenAPI/Swagger using @hono/swagger-ui and @hono/zod-openapi.
  - Write unit and integration tests for API routes and services.
  - Use environment variables for configuration with proper validation.
  - Implement rate limiting for public-facing endpoints.
  - Apply consistent logging patterns using Pino logger.

  # Git Usage
  - Use conventional commit format with prefixes:
    - "fix:" for bug fixes
    - "feat:" for new features
    - "perf:" for performance improvements
    - "docs:" for documentation changes
    - "style:" for formatting changes
    - "refactor:" for code refactoring
    - "test:" for adding missing tests
    - "chore:" for maintenance tasks
  - Use lowercase for commit messages.
  - Add descriptive details after the summary line for non-trivial changes.
  - Keep commits focused on single logical changes.
  - Reference issue numbers in commits when applicable.

  # General Coding Practices
  - Always read and understand a file before editing it.
  - Follow existing patterns and conventions in the codebase.
  - Use descriptive variable names with auxiliary verbs (isLoading, hasError).
  - Keep functions and components small and focused.
  - Prefer immutability whenever possible.
  - Use consistent error handling patterns.
  - Add meaningful comments only when necessary to explain complex logic.
  - Use consistent naming conventions across the codebase.
  - Follow the DRY principle (Don't Repeat Yourself) through modularization.
  - Implement proper authentication and authorization checks.

  
