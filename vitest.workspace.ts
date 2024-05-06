import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*',
  {
    extends: './vitest.config.ts',
    test: {
      include: ['**/*.{spec,test}.ts'],
      name: 'unit',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      include: ['**/*.e2e.ts'],
      name: 'e2e',
    },
  },
]);
