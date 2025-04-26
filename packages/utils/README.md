# @ngdi/utils

This package contains shared utility functions for the NGDI Portal.

## Usage

```typescript
import { formatDate, truncate, isValidEmail } from '@ngdi/utils';

// Use the utilities
const formattedDate = formatDate(new Date());
const truncatedText = truncate('This is a long text', 10);
const isValid = isValidEmail('user@example.com');
```

## Contents

- `date.ts` - Date formatting and manipulation utilities
- `string.ts` - String manipulation utilities
- `validation.ts` - Validation utilities
