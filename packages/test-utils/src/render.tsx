import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that includes global providers
 */
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { ...options });
}

/**
 * Create a wrapper with providers for testing
 */
export function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
}

// Re-export everything from testing-library
export * from '@testing-library/react';
