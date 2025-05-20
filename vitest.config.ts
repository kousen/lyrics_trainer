import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    includeSource: ['src/**/*.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    globals: true
  },
})