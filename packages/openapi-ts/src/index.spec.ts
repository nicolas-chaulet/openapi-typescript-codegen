import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it } from 'vitest';

import { createClient } from './index';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const v2Spec = path.resolve(__dirname, '../test/spec/v2.json');
const v3Spec = path.resolve(__dirname, '../test/spec/v3.json');

describe('index', () => {
  it('parses v2 without issues', async () => {
    await createClient({
      dryRun: true,
      input: v2Spec,
      output: path.resolve(__dirname, '../test/generated/v2/'),
    });
  });

  it('parses v3 without issues', async () => {
    await createClient({
      dryRun: true,
      input: v3Spec,
      output: path.resolve(__dirname, '../test/generated/v3/'),
    });
  });

  it('downloads and parses v2 without issues', async () => {
    await createClient({
      dryRun: true,
      input:
        'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts/test/spec/v2.json',
      output: path.resolve(__dirname, '../test/generated/v2-downloaded/'),
    });
  });

  it('downloads and parses v3 without issues', async () => {
    await createClient({
      dryRun: true,
      input:
        'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts/test/spec/v3.json',
      output: path.resolve(__dirname, '../test/generated/v3-downloaded/'),
    });
  });
});
