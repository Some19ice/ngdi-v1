# NGDI Monorepo Refactoring Plan

## Overview

This document outlines a comprehensive plan for refactoring the NGDI codebase into a well-structured monorepo. The refactoring aims to improve code organization, reduce duplication, enhance developer experience, and set up the project for better scalability and maintainability.

## Current State Analysis

The NGDI Portal currently has a partial monorepo structure with:

- A Next.js frontend application in the root directory
- A Hono.js API server in the `packages/api` directory
- Shared types in the `/types` directory
- Utilities in the `/lib` directory
- npm workspaces configured but underutilized

### Issues Identified

1. **Suboptimal Code Organization**: Frontend code is in the root directory instead of a dedicated package
2. **Duplicate Dependencies**: Several dependencies duplicated between root and API packages
3. **Shared Code Not in Dedicated Packages**: Common utilities and types not properly isolated
4. **Duplicated Configuration**: Separate Prisma configurations in both root and API packages
5. **Underutilized Workspace Structure**: Only a single package (api) in the workspace

## Target Architecture

```
├── package.json          # Root package.json with workspaces and dev dependencies
├── turbo.json            # Turborepo configuration
├── tsconfig.json         # Base TypeScript configuration
├── .eslintrc.js          # Base ESLint configuration
├── docs/                 # Documentation
├── packages/
│   ├── web/              # Next.js frontend (moved from root)
│   │   ├── src/          # Frontend source code
│   │   ├── public/       # Static assets
│   │   └── package.json  # Frontend-specific dependencies
│   ├── api/              # Hono.js backend (existing)
│   │   ├── src/          # API source code
│   │   ├── tests/        # API tests
│   │   └── package.json  # API-specific dependencies
│   ├── db/               # Database package
│   │   ├── prisma/       # Single source of truth for DB schema
│   │   ├── src/          # Typed Prisma client exports
│   │   └── package.json  # DB package dependencies
│   ├── ui/               # Shared UI components
│   │   ├── src/          # UI component source code
│   │   ├── stories/      # Storybook stories
│   │   └── package.json  # UI package dependencies
│   ├── types/            # Shared TypeScript types
│   │   ├── src/          # Type definitions
│   │   └── package.json  # Types package dependencies
│   └── utils/            # Shared utilities
│       ├── src/          # Utility functions
│       ├── tests/        # Utility tests
│       └── package.json  # Utils package dependencies
└── apps/                 # (Optional) For additional applications
```

## Phase 1: Preparation and Setup

### 1.1 Setup Monorepo Tools

1. **Install and Configure Turborepo**:

   ```bash
   npm install -D turbo
   ```

2. **Create Turborepo Configuration**:

   ```json
   // turbo.json
   {
     "$schema": "https://turbo.build/schema.json",
     "pipeline": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**", ".next/**"]
       },
       "test": {
         "dependsOn": ["build"]
       },
       "lint": {},
       "dev": {
         "cache": false,
         "persistent": true
       }
     }
   }
   ```

3. **Update Root Package.json**:
   ```json
   {
     "name": "ngdi-monorepo",
     "private": true,
     "workspaces": ["packages/*"],
     "scripts": {
       "dev": "turbo run dev",
       "build": "turbo run build",
       "test": "turbo run test",
       "lint": "turbo run lint"
     }
   }
   ```

### 1.2 Create Base Configurations

1. **Base TypeScript Configuration**:

   ```json
   // tsconfig.base.json
   {
     "compilerOptions": {
       "target": "es2020",
       "module": "esnext",
       "moduleResolution": "bundler",
       "esModuleInterop": true,
       "strict": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "isolatedModules": true
     }
   }
   ```

2. **Base ESLint Configuration**:
   ```javascript
   // .eslintrc.base.js
   module.exports = {
     extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
     parser: "@typescript-eslint/parser",
     plugins: ["@typescript-eslint"],
     root: true,
   }
   ```

## Phase 2: Package Creation and Code Migration

### 2.1 Create Database Package

1. **Create Package Structure**:

   ```bash
   mkdir -p packages/db/src packages/db/prisma
   ```

2. **Move Prisma Schema**:

   - Move the Prisma schema from the root to `packages/db/prisma`
   - Update any references to the schema

3. **Create Package.json**:

   ```json
   {
     "name": "@ngdi/db",
     "version": "0.1.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "scripts": {
       "build": "tsc",
       "db:generate": "prisma generate",
       "db:push": "prisma db push",
       "db:studio": "prisma studio"
     },
     "dependencies": {
       "@prisma/client": "^5.0.0"
     },
     "devDependencies": {
       "prisma": "^5.0.0",
       "typescript": "^5.0.0"
     }
   }
   ```

4. **Create Client Export**:

   ```typescript
   // packages/db/src/index.ts
   import { PrismaClient } from "@prisma/client"

   export * from "@prisma/client"

   const globalForPrisma = global as unknown as { prisma: PrismaClient }

   export const prisma = globalForPrisma.prisma || new PrismaClient()

   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
   ```

### 2.2 Create Types Package

1. **Create Package Structure**:

   ```bash
   mkdir -p packages/types/src
   ```

2. **Move Type Definitions**:

   - Move types from `/types` to `packages/types/src`
   - Organize types by domain (auth, user, metadata, etc.)

3. **Create Package.json**:

   ```json
   {
     "name": "@ngdi/types",
     "version": "0.1.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "scripts": {
       "build": "tsc",
       "lint": "eslint src"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "eslint": "^8.0.0"
     }
   }
   ```

4. **Create Index Export**:
   ```typescript
   // packages/types/src/index.ts
   export * from "./auth"
   export * from "./user"
   export * from "./metadata"
   // Add other exports as needed
   ```

### 2.3 Create Utils Package

1. **Create Package Structure**:

   ```bash
   mkdir -p packages/utils/src packages/utils/tests
   ```

2. **Move Utility Functions**:

   - Move utilities from `/lib` to `packages/utils/src`
   - Organize utilities by function (date, string, validation, etc.)

3. **Create Package.json**:

   ```json
   {
     "name": "@ngdi/utils",
     "version": "0.1.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "scripts": {
       "build": "tsc",
       "test": "vitest run",
       "test:watch": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest run --coverage",
       "lint": "eslint src"
     },
     "dependencies": {
       "@ngdi/types": "workspace:*"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "vitest": "^0.34.0",
       "@vitest/ui": "^0.34.0",
       "@vitest/coverage-v8": "^0.34.0",
       "eslint": "^8.0.0"
     }
   }
   ```

4. **Create Index Export**:
   ```typescript
   // packages/utils/src/index.ts
   export * from "./date"
   export * from "./string"
   export * from "./validation"
   // Add other exports as needed
   ```

### 2.4 Create UI Package

1. **Create Package Structure**:

   ```bash
   mkdir -p packages/ui/src packages/ui/stories
   ```

2. **Move UI Components**:

   - Extract reusable UI components from the frontend
   - Move them to `packages/ui/src`

3. **Create Package.json**:

   ```json
   {
     "name": "@ngdi/ui",
     "version": "0.1.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch",
       "storybook": "storybook dev -p 6006",
       "lint": "eslint src"
     },
     "dependencies": {
       "react": "^18.0.0",
       "react-dom": "^18.0.0"
     },
     "devDependencies": {
       "@storybook/react": "^7.0.0",
       "typescript": "^5.0.0",
       "tsup": "^7.0.0",
       "eslint": "^8.0.0"
     }
   }
   ```

4. **Create Index Export**:
   ```typescript
   // packages/ui/src/index.ts
   export * from "./components/button"
   export * from "./components/card"
   export * from "./components/input"
   // Add other exports as needed
   ```

### 2.5 Create Web Package

1. **Create Package Structure**:

   ```bash
   mkdir -p packages/web
   ```

2. **Move Frontend Code**:

   - Move Next.js application from root to `packages/web`
   - Update imports to use workspace packages

3. **Create Package.json**:
   ```json
   {
     "name": "@ngdi/web",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "test": "vitest run",
       "test:watch": "vitest",
       "test:ui": "vitest --ui"
     },
     "dependencies": {
       "@ngdi/db": "workspace:*",
       "@ngdi/types": "workspace:*",
       "@ngdi/ui": "workspace:*",
       "@ngdi/utils": "workspace:*",
       "next": "^13.0.0",
       "react": "^18.0.0",
       "react-dom": "^18.0.0"
     },
     "devDependencies": {
       "@types/react": "^18.0.0",
       "@types/react-dom": "^18.0.0",
       "typescript": "^5.0.0",
       "eslint": "^8.0.0",
       "eslint-config-next": "^13.0.0",
       "vitest": "^0.34.0",
       "@vitest/ui": "^0.34.0",
       "happy-dom": "^12.0.0"
     }
   }
   ```

### 2.6 Update API Package

1. **Update Package.json**:

   ```json
   {
     "name": "@ngdi/api",
     "version": "0.1.0",
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsup",
       "start": "node dist/index.js",
       "test": "vitest run",
       "test:watch": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest run --coverage",
       "lint": "eslint src"
     },
     "dependencies": {
       "@ngdi/db": "workspace:*",
       "@ngdi/types": "workspace:*",
       "@ngdi/utils": "workspace:*",
       "hono": "^3.0.0"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "tsup": "^7.0.0",
       "tsx": "^3.12.0",
       "vitest": "^0.34.0",
       "@vitest/ui": "^0.34.0",
       "@vitest/coverage-v8": "^0.34.0",
       "eslint": "^8.0.0"
     }
   }
   ```

2. **Update Imports**:
   - Update imports to use workspace packages
   - Remove duplicated code that's now in shared packages

## Phase 3: Configuration and Integration

### 3.1 Update Package References

1. **Update TypeScript Configurations**:

   - Create/update `tsconfig.json` in each package to extend the base config
   - Set up project references for proper build ordering

2. **Update ESLint Configurations**:
   - Create/update `.eslintrc.js` in each package to extend the base config
   - Add package-specific rules as needed

### 3.2 Set Up Development Scripts

1. **Update Root Scripts**:

   ```json
   {
     "scripts": {
       "dev": "turbo run dev",
       "build": "turbo run build",
       "test": "turbo run test",
       "lint": "turbo run lint",
       "clean": "turbo run clean && rm -rf node_modules",
       "format": "prettier --write \"**/*.{ts,tsx,md}\""
     }
   }
   ```

2. **Configure Turborepo Pipelines**:
   - Ensure proper dependency ordering in the build pipeline
   - Set up caching for improved performance

### 3.3 Set Up CI/CD Pipeline

1. **Create GitHub Actions Workflow**:

   ```yaml
   # .github/workflows/ci.yml
   name: CI

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: "npm"
         - run: npm ci
         - run: npm run build
         - run: npm run lint
         - run: npm run test
   ```

## Phase 4: Testing and Validation

### 4.1 Implement Testing Strategy

1. **Set Up Testing Framework**:

   - Configure Vitest for all testing needs (unit, integration, and component tests)
   - Set up Vitest UI for interactive test debugging
   - Configure Vitest for browser environment testing using happy-dom or jsdom

2. **Create Test Utilities**:
   - Add test helpers in the utils package
   - Create mock data generators
   - Implement custom Vitest matchers for common assertions

### 4.2 Validate the Refactored Codebase

1. **Run All Tests**:

   - Ensure all tests pass after the refactoring
   - Add new tests for any uncovered functionality

2. **Manual Testing**:
   - Test the application locally
   - Verify all features work as expected

## Phase 5: Documentation and Cleanup

### 5.1 Update Documentation

1. **Update READMEs**:

   - Create/update README.md for each package
   - Update the root README.md with monorepo instructions

2. **Create Development Guides**:
   - Document the development workflow
   - Add contribution guidelines

### 5.2 Final Cleanup

1. **Remove Unused Code**:

   - Delete any duplicated or unused files
   - Clean up dependencies

2. **Optimize Build Process**:
   - Fine-tune Turborepo configuration
   - Optimize build times

## Detailed Migration Strategy

### Incremental Migration Approach

To minimize disruption to ongoing development, we'll adopt an incremental migration approach:

1. **Create the new structure in parallel**: Set up the new package structure while keeping the existing code functional.
2. **Migrate one package at a time**: Start with the least dependent packages (types, utils) and work up to more complex ones.
3. **Use feature flags**: Implement feature flags to toggle between old and new implementations during transition.
4. **Maintain backward compatibility**: Ensure APIs remain compatible during the migration.
5. **Continuous integration**: Keep CI/CD running on both old and new structures until migration is complete.

### Package Migration Order

1. **@ngdi/types**: Minimal dependencies, foundation for other packages
2. **@ngdi/db**: Database layer with Prisma schema
3. **@ngdi/utils**: Utility functions that depend on types
4. **@ngdi/ui**: UI components that may depend on utils and types
5. **@ngdi/api**: API server that depends on all the above
6. **@ngdi/web**: Frontend application that depends on all the above

### Code Migration Techniques

For each package, follow these steps:

1. **Copy and adapt**: Copy the code to the new location and adapt imports
2. **Test in isolation**: Ensure the package works independently
3. **Integrate**: Update consumers to use the new package
4. **Validate**: Test the integration thoroughly
5. **Remove old code**: Once everything is working, remove the old code

### Dependency Management Strategy

1. **Audit current dependencies**: Review all dependencies to identify:

   - Core dependencies needed in multiple packages
   - Package-specific dependencies
   - Duplicate or unnecessary dependencies

2. **Hoist common dependencies**: Move widely used dependencies to the root package.json

3. **Use workspace protocol**: Update package.json files to use workspace dependencies:

   ```json
   "dependencies": {
     "@ngdi/types": "workspace:*"
   }
   ```

4. **Version alignment**: Ensure consistent versions of shared dependencies across packages

## Implementation Timeline

| Phase | Description                    | Tasks                                                                                                                                                                                          | Estimated Duration |
| ----- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1     | Preparation and Setup          | - Install Turborepo<br>- Create base configurations<br>- Set up CI/CD                                                                                                                          | 1 week             |
| 2     | Package Creation and Migration | - Create and migrate @ngdi/types<br>- Create and migrate @ngdi/db<br>- Create and migrate @ngdi/utils<br>- Create and migrate @ngdi/ui<br>- Create and migrate @ngdi/web<br>- Update @ngdi/api | 2-3 weeks          |
| 3     | Configuration and Integration  | - Update package references<br>- Set up development scripts<br>- Configure build pipelines                                                                                                     | 1 week             |
| 4     | Testing and Validation         | - Implement testing strategy<br>- Run all tests<br>- Perform manual testing                                                                                                                    | 1-2 weeks          |
| 5     | Documentation and Cleanup      | - Update documentation<br>- Remove unused code<br>- Optimize build process                                                                                                                     | 1 week             |

**Total Estimated Time**: 6-8 weeks

## Risk Assessment and Mitigation

| Risk                                | Impact | Likelihood | Mitigation                                          |
| ----------------------------------- | ------ | ---------- | --------------------------------------------------- |
| Breaking changes during refactoring | High   | Medium     | Comprehensive test coverage, incremental changes    |
| Performance degradation             | Medium | Low        | Performance testing before and after                |
| Developer learning curve            | Medium | Medium     | Thorough documentation, pair programming            |
| Deployment issues                   | High   | Medium     | Staged rollout, rollback plan                       |
| Dependency conflicts                | Medium | Medium     | Careful dependency management, lockfile maintenance |

## Success Criteria

The refactoring will be considered successful when:

1. All functionality works as before
2. Build times are maintained or improved
3. Code duplication is significantly reduced
4. Developer experience is enhanced
5. All tests pass
6. Documentation is complete and accurate

## Benefits and Challenges

### Benefits of the Monorepo Refactoring

1. **Improved Code Organization**

   - Clear separation of concerns with dedicated packages
   - Better discoverability of code
   - Logical grouping of related functionality

2. **Enhanced Developer Experience**

   - Simplified dependency management
   - Consistent tooling and configurations
   - Easier onboarding for new developers
   - Improved IDE support with proper TypeScript project references

3. **Better Code Reuse**

   - Shared types ensure consistency across packages
   - Common utilities available to all packages
   - Reusable UI components

4. **Streamlined Build Process**

   - Optimized builds with Turborepo
   - Intelligent caching for faster development
   - Parallel execution of tasks

5. **Improved Maintainability**
   - Smaller, focused packages are easier to maintain
   - Clearer boundaries between components
   - Better testing isolation

### Challenges and Mitigations

1. **Increased Complexity**

   - **Challenge**: Monorepos add complexity to the project structure
   - **Mitigation**: Thorough documentation and clear guidelines

2. **Learning Curve**

   - **Challenge**: Developers need to learn new tools and workflows
   - **Mitigation**: Training sessions, pair programming, and documentation

3. **Build Performance**

   - **Challenge**: Large monorepos can have slow builds
   - **Mitigation**: Turborepo caching, optimized build configurations

4. **Versioning Complexity**

   - **Challenge**: Managing versions across packages can be difficult
   - **Mitigation**: Consistent versioning strategy, use of tools like Changesets

5. **Migration Risks**
   - **Challenge**: Refactoring can introduce bugs or regressions
   - **Mitigation**: Comprehensive testing, incremental approach

## Practical Example: Migrating the Authentication Flow

To illustrate the refactoring process, let's walk through a practical example of migrating the authentication flow:

### Current Structure

```
/lib/auth.ts                 # Authentication utilities
/lib/auth-client.ts          # Client-side auth functions
/types/auth.d.ts             # Auth-related type definitions
/pages/api/auth/[...].ts     # Next.js API routes for auth
/packages/api/src/routes/auth.routes.ts  # API server auth routes
```

### Target Structure

```
/packages/types/src/auth.ts           # Shared auth types
/packages/utils/src/auth/index.ts     # Auth utilities
/packages/utils/src/auth/client.ts    # Client-side auth functions
/packages/web/pages/api/auth/[...].ts # Next.js API routes
/packages/api/src/routes/auth.routes.ts # API server auth routes
```

### Migration Steps

1. **Create Types Package**:

   ```typescript
   // packages/types/src/auth.ts
   export interface User {
     id: string
     email: string
     name: string
     role: UserRole
   }

   export enum UserRole {
     ADMIN = "ADMIN",
     USER = "USER",
     GUEST = "GUEST",
   }

   export interface Session {
     user: User
     expires: string
     accessToken: string
   }
   ```

2. **Create Utils Package**:

   ```typescript
   // packages/utils/src/auth/index.ts
   import { User, Session } from "@ngdi/types"

   export async function validateToken(token: string): Promise<User | null> {
     // Implementation
   }

   export async function createSession(user: User): Promise<Session> {
     // Implementation
   }
   ```

3. **Update API Package**:

   ```typescript
   // packages/api/src/routes/auth.routes.ts
   import { validateToken, createSession } from "@ngdi/utils"
   import { User, Session } from "@ngdi/types"

   // Implementation using the shared utilities and types
   ```

4. **Update Web Package**:

   ```typescript
   // packages/web/pages/api/auth/[...].ts
   import { validateToken, createSession } from "@ngdi/utils"
   import { User, Session } from "@ngdi/types"

   // Implementation using the shared utilities and types
   ```

5. **Test the Integration**:

   - Verify authentication works end-to-end
   - Ensure all auth-related functionality is preserved

6. **Remove Old Code**:
   - Once everything is working, remove the original files

This example demonstrates how a core feature like authentication can be refactored to leverage the monorepo structure, resulting in better code organization and reuse.

## Conclusion

This refactoring plan provides a structured approach to transforming the NGDI codebase into a well-organized monorepo. By following this plan, we will improve code organization, reduce duplication, enhance developer experience, and set up the project for better scalability and maintainability in the future.

The incremental migration strategy ensures minimal disruption to ongoing development while the detailed package structure provides clear guidance for implementation. The benefits of this refactoring—improved code organization, enhanced developer experience, better code reuse, streamlined build process, and improved maintainability—far outweigh the challenges, which can be effectively mitigated with proper planning and execution.

By implementing this plan, the NGDI project will be well-positioned for future growth and development, with a codebase that is easier to maintain, extend, and contribute to.
