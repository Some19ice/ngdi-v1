import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@ngdi/test-utils": resolve(__dirname, "../test-utils/src"),
      "@ngdi/types": resolve(__dirname, "../types/src"),
    },
  },
})
