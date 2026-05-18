import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.e2e.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
