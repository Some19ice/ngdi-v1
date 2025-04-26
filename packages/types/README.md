# @ngdi/types

This package contains shared TypeScript types for the NGDI Portal.

## Usage

```typescript
import { UserProfile, MetadataResponse } from '@ngdi/types';

// Use the types
const user: UserProfile = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.USER,
  emailVerified: null,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01'
};
```

## Contents

- `api.ts` - API response and error types
- `auth.ts` - Authentication related types
- `metadata.ts` - Metadata related types
- `user.ts` - User related types
