# API Services and Error Handling

This directory contains standardized API services and error handling utilities for the NGDI Portal application.

## Overview

The API services in this directory provide a consistent way to interact with the backend API. They include:

- Standardized API client with retry logic
- Service factory for creating API services
- Service registry for centralized access to all API services
- Error handling utilities

## Usage

### Basic Usage

```tsx
import { services } from "@/lib/api/service-registry";

// Get metadata
const metadata = await services.metadata.getById("123");

// Create metadata
const newMetadata = await services.metadata.create({
  title: "New Metadata",
  description: "Description",
});

// Update metadata
await services.metadata.update("123", {
  title: "Updated Title",
});

// Delete metadata
await services.metadata.delete("123");
```

### With React Query

```tsx
import { useApiQuery, useApiMutation } from "@/hooks/use-api-query";
import { services } from "@/lib/api/service-registry";

function MetadataList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useApiQuery(
    ["metadata", page],
    () => services.metadata.getPaginated(page, 10),
    {
      keepPreviousData: true,
    }
  );

  // Rest of component...
}
```

### With ApiDataWrapper

```tsx
import { ApiDataWrapper } from "@/components/wrappers/api-data-wrapper";
import { services } from "@/lib/api/service-registry";

function MetadataDetails({ id }) {
  return (
    <ApiDataWrapper
      fetchData={() => services.metadata.getById(id)}
      dependencies={[id]}
    >
      {(data) => (
        <div>
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
      )}
    </ApiDataWrapper>
  );
}
```

### With Error Boundaries

```tsx
import { PageErrorBoundary } from "@/components/wrappers/page-error-boundary";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function MetadataPage() {
  return (
    <PageErrorBoundary>
      <div>
        <h1>Metadata</h1>
        <ErrorBoundary>
          <MetadataList />
        </ErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}
```

## Available Services

The following services are available in the service registry:

- `metadata`: Metadata API service
- `user`: User API service
- `search`: Search API service
- `activity`: Activity logs API service
- `permissions`: Permissions API service
- `roles`: Roles API service
- `settings`: Settings API service
- `admin`: Admin API service

## Error Handling

The API services include comprehensive error handling:

- Automatic retry for transient errors
- Consistent error formatting
- Integration with toast notifications
- Error boundary components for React components

## Components

The following components are available for error handling:

- `ErrorBoundary`: A React error boundary component
- `PageErrorBoundary`: A specialized error boundary for pages
- `ApiDataWrapper`: A wrapper for API data fetching with loading and error states

## Hooks

The following hooks are available for API data fetching:

- `useApiQuery`: A hook for using API services with React Query
- `useApiMutation`: A hook for using API mutations with React Query

## Example

See `packages/web/src/components/examples/metadata-list-example.tsx` for a complete example of how to use the API services and error handling.
