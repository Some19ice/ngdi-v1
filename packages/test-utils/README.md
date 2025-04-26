# @ngdi/test-utils

This package provides testing utilities for the NGDI monorepo.

## Features

- Custom render function with providers
- Mock data generators
- Common test utilities

## Usage

```tsx
import { render, mockUser, generateMetadata } from '@ngdi/test-utils';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent user={mockUser} />);
    expect(getByText('Welcome, Test User')).toBeInTheDocument();
  });

  it('displays metadata', () => {
    const metadata = generateMetadata(1)[0];
    const { getByText } = render(<MyComponent metadata={metadata} />);
    expect(getByText(metadata.title)).toBeInTheDocument();
  });
});
```

## API

### Render Functions

- `render`: Custom render function that includes global providers
- `createWrapper`: Create a wrapper with providers for testing

### Mock Data

- `mockUser`: Mock user for testing
- `mockAdminUser`: Mock admin user for testing
- `mockSession`: Mock session for testing
- `mockSupabaseClient`: Mock Supabase client for testing

### Data Generators

- `generateMetadata(count)`: Generate test metadata
- `generateUsers(count)`: Generate test users
- `generateOrganizations(count)`: Generate test organizations
