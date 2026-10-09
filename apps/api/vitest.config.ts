import { defineConfig } from 'vitest/config';

/** Unit tests of pure logic; the e2e suite has its own config. */
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
  },
});
