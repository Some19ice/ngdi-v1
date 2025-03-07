# Introduction

The **NGDI Web Portal** is Nigeria's central platform for geospatial data management, discovery, and sharing. Built with Next.js 14 and modern web technologies, it serves as the authoritative source for Nigeria's geospatial data infrastructure. The platform implements best practices for server and client components, utilizing Shadcn UI and Tailwind CSS for a polished, accessible interface.

# Architecture Overview

## Tech Stack
- Next.js 14 with App Router
- TypeScript for type safety
- React Server Components (RSC)
- Django REST Framework backend
- React-Leaflet for map integration
- Shadcn UI for component library
- Tailwind CSS for styling
- React Query/TanStack Query for data management
- React Hook Form with Zod for form validation
- Redux Toolkit for complex state management

## Directory Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── password-reset/
│   ├── api/
│   │   ├── auth/
│   │   ├── metadata/
│   │   ├── maps/
│   │   └── users/
│   ├── metadata/
│   │   ├── add/
│   │   ├── edit/
│   │   └── [id]/
│   ├── maps/
│   │   ├── components/
│   │   └── layers/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── maps/
│   │   └── shared/
│   └── lib/
```

# Authentication Flow

User authentication implements a secure, role-based approach:
1. User registration with email verification
2. Login with secure session management
3. Role-based access control (RBAC)
4. Protected routes with middleware validation
5. Password reset capability
6. Future support for multi-factor authentication

# Component Architecture

## Server Components (Default)
- Page components
- Metadata management components
- Data fetching components
- Static UI elements
- Map layer management

## Client Components ('use client')
- Interactive map components
- Form components with validation
- Search interface components
- Dynamic features requiring browser APIs
- Real-time update components

# Data Management

## Metadata System
- Three-step metadata entry process
- Form validation with Zod
- File upload handling
- Quality control checks
- Support for multiple data types

## Search System
- Multi-criteria search functionality
- Geospatial filtering
- Organization-based filtering
- Real-time search results
- Export capabilities

## Map Interface
- Dynamic map visualization
- Layer management
- Spatial query capabilities
- Area selection tools
- Distance measurement
- Location search
- Coordinate display

# Data Fetching Patterns

## Server-Side
- Route handlers for API endpoints
- Server components with Django REST Framework integration
- Cached and revalidated data using Next.js patterns
- Metadata validation endpoints
- Map data streaming

## Client-Side
- React Query for data fetching and caching
- WebSocket for real-time updates
- Error boundaries for graceful failure handling
- Progressive loading for large datasets

# State Management

## Global State
- Redux Toolkit for complex state
- React Query for server state
- Authentication state management

## URL State
- Search parameters management
- Map state persistence
- Filter configurations
- Pagination state

## Form State
- React Hook Form for form management
- Zod schema validation
- Multi-step form state
- File upload state

# Performance Optimization

## Core Web Vitals
- Optimized LCP through image optimization
- Minimal CLS with proper layout structure
- Improved FID through code splitting
- Edge runtime optimization

## Loading States
- Suspense boundaries for async operations
- Loading skeletons using Shadcn UI
- Progressive enhancement
- Streaming SSR for large datasets

# Styling Approach

## Tailwind CSS
- Mobile-first responsive design
- Custom theme configuration
- WCAG 2.1 AA compliance
- High contrast mode support

## Shadcn UI Components
- Accessible component primitives
- Customized theme variables
- Consistent component API
- Screen reader compatibility

# Error Handling

## Client-Side
- React Error Boundaries
- Toast notifications
- Graceful fallbacks
- Offline support

## Server-Side
- Structured error responses
- Logging and monitoring
- Recovery strategies
- Rate limiting

# Security Measures

- HTTPS encryption
- JWT token authentication
- SQL injection prevention
- XSS attack protection
- Regular security audits
- CORS configuration
- API rate limiting

# Deployment and CI/CD

- Docker containerization
- AWS/Azure cloud hosting
- GitHub Actions for CI/CD
- Nginx web server
- Environment-specific configurations
- Automated testing
- Performance monitoring

# Development Workflow

## Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Husky pre-commit hooks
- Code review process

## Testing Strategy
- Unit tests with Jest
- Component tests with Testing Library
- E2E tests with Cypress
- API testing with Postman
- Performance testing with Lighthouse

This document serves as a living guide for the NGDI Web Portal's architecture and will be updated as the project evolves. It aligns with the ISO 19115 metadata standards, OGC web services standards, and Nigerian data protection regulations. 