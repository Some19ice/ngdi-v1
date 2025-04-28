# Component Rendering Optimization

This directory contains utilities and components for optimizing rendering performance in the NGDI Portal application.

## Overview

The optimization utilities in this directory help improve rendering performance by:

1. **Memoizing components** to prevent unnecessary re-renders
2. **Virtualizing lists** to only render visible items
3. **Lazy loading images** to improve initial load time
4. **Deferring non-critical UI** to prioritize important content
5. **Monitoring performance** to identify bottlenecks

## Utilities

### Memoization Utilities

The `memo-utils.ts` file provides utilities for memoizing components and values:

```tsx
// Memoize a component with deep comparison
const MemoizedComponent = memoWithDeepCompare(MyComponent);

// Memoize a value with deep comparison
const memoizedValue = useDeepMemo(complexObject, [dependency1, dependency2]);

// Memoize a callback with deep comparison
const memoizedCallback = useDeepCallback(() => {
  // Complex callback
}, [dependency1, dependency2]);

// Check if component is mounted
const isMounted = useIsMounted();

// Debounce a value
const debouncedValue = useDebounce(value, 300);

// Throttle a callback
const throttledCallback = useThrottle(() => {
  // Expensive operation
}, 100);

// Check if element is in view
const { ref, isInView } = useInView();
```

### Higher-Order Components

The `with-memo.tsx` file provides HOCs for memoizing components:

```tsx
// Memoize a component
const MemoizedComponent = withMemo(MyComponent);

// Memoize a component with debugging
const DebuggedComponent = withMemoDebug(MyComponent);
```

### Performance Monitoring

The `performance-monitor.ts` file provides utilities for monitoring component performance:

```tsx
// Enable performance monitoring
performanceMonitor.enable();

// Disable performance monitoring
performanceMonitor.disable();

// Set log threshold
performanceMonitor.setLogThreshold(16);

// Get metrics
const metrics = performanceMonitor.getMetrics();

// Log metrics to console
performanceMonitor.logMetrics();

// Reset metrics
performanceMonitor.resetMetrics();
```

## Components

### VirtualizedList

The `VirtualizedList` component renders only the items that are visible in the viewport:

```tsx
<VirtualizedList
  items={items}
  renderItem={(item, index) => (
    <div>{item.name}</div>
  )}
  itemHeight={50}
  className="h-96"
  overscan={5}
  onEndReached={() => loadMoreItems()}
/>
```

### LazyImage

The `LazyImage` component loads images only when they're in the viewport:

```tsx
<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  width={300}
  height={200}
  showLoadingIndicator
/>
```

### DeferredRender

The `DeferredRender` component defers rendering of non-critical UI:

```tsx
<DeferredRender delay={500} priority="low">
  <ExpensiveComponent />
</DeferredRender>
```

## Performance Monitoring

The `PerformanceMonitor` component provides a UI for monitoring component performance:

```tsx
<PerformanceMonitor />
```

The `usePerformanceMonitor` hook can be used to monitor individual components:

```tsx
function MyComponent() {
  usePerformanceMonitor("MyComponent");
  // ...
}
```

## Best Practices

1. **Memoize expensive components**: Use `React.memo` or `withMemo` for components that render frequently
2. **Use virtualization for long lists**: Use `VirtualizedList` for lists with many items
3. **Lazy load images**: Use `LazyImage` for images that aren't immediately visible
4. **Defer non-critical UI**: Use `DeferredRender` for components that aren't needed immediately
5. **Monitor performance**: Use `usePerformanceMonitor` to identify bottlenecks
6. **Optimize event handlers**: Use `useCallback` to prevent unnecessary re-renders
7. **Optimize computed values**: Use `useMemo` for expensive calculations
8. **Avoid unnecessary state updates**: Only update state when necessary
9. **Use proper keys for lists**: Use stable, unique keys for list items
10. **Split large components**: Break large components into smaller, focused ones
