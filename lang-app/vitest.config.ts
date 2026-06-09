import { defineConfig } from 'vitest/config';

// Test logic thuần (chấm điểm, phát hiện crisis) — chạy trên Node, độc lập với Angular/karma.
export default defineConfig({
  test: {
    include: ['src/**/*.vitest.ts'],
    environment: 'node',
  },
});
