# @ngdi/ui

This package contains shared UI components for the NGDI Portal.

## Usage

```tsx
import { Button, Card } from '@ngdi/ui';

function MyComponent() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Card Title</Card.Title>
        <Card.Description>Card Description</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>Card Content</p>
      </Card.Content>
      <Card.Footer>
        <Button>Click Me</Button>
      </Card.Footer>
    </Card>
  );
}
```

## Components

- `Button` - Button component with various styles
- `Card` - Card component with header, content, and footer
