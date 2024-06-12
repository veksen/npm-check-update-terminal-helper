/// <reference types="vitest" />

import { defineConfig } from 'vite';

// eslint-disable-next-line import/no-default-export -- by design
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['**/*.test.ts', "**/*.test.tsx"],
  },
});