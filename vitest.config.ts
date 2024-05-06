import { configDefaults, defineConfig } from 'vitest/config';

import { handlebarsPlugin } from './packages/openapi-ts/rollup.config';

export default defineConfig({
  plugins: [handlebarsPlugin()],
  test: {
    coverage: {
      exclude: ['**/bin', '**/dist', '**/*.d.ts', '**/generated/**'],
      include: ['**/src/**/*.ts'],
      provider: 'v8',
    },
    exclude: [...configDefaults.exclude],
  },
});
