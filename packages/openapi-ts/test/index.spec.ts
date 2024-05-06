import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sync } from 'glob';
import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { UserConfig } from '../src/types/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const V2_SPEC_PATH = path.resolve(__dirname, 'spec/v2.json');
const V3_SPEC_PATH = path.resolve(__dirname, 'spec/v3.json');

const OUTPUT_PREFIX = path.resolve(__dirname, 'generated/');

const toOutputPath = (name: string) => path.resolve(OUTPUT_PREFIX, name);
const toSnapshotPath = (file: string) =>
  path.resolve(
    __dirname,
    `__snapshots__/${file.replace(OUTPUT_PREFIX, '')}.snap`,
  );

describe('OpenAPI v2', () => {
  it.each([
    {
      config: {
        client: 'fetch',
        enums: 'javascript',
        exportCore: true,
        input: '',
        output: '',
        schemas: true,
        services: true,
        types: true,
        useOptions: true,
      } as UserConfig,
      description: 'generate fetch client',
      name: 'v2',
    },
  ])('$description', async ({ name, config }) => {
    const output = toOutputPath(name);
    await createClient({
      ...config,
      input: V2_SPEC_PATH,
      output,
    });
    sync(path.resolve(output, '**/*.ts')).forEach((file) => {
      const content = readFileSync(file, { encoding: 'utf-8' });
      expect(content).toMatchFileSnapshot(toSnapshotPath(file));
    });
  });
});

describe('OpenAPI v3', () => {
  const config: UserConfig = {
    client: 'fetch',
    enums: 'javascript',
    exportCore: true,
    input: '',
    output: '',
    schemas: true,
    services: true,
    types: true,
    useOptions: true,
  };

  it.each([
    {
      config: {
        ...config,
      },
      description: 'generate fetch client',
      name: 'v3',
    },
    {
      config: {
        ...config,
        client: 'angular',
        enums: false,
        schemas: false,
      } as UserConfig,
      description: 'generate angular client',
      name: 'v3_angular',
    },
    {
      config: {
        ...config,
        client: 'node',
        enums: false,
        schemas: false,
        services: false,
        types: false,
      } as UserConfig,
      description: 'generate node client',
      name: 'v3_node',
    },
    {
      config: {
        ...config,
        client: 'axios',
        enums: false,
        schemas: false,
        services: false,
        types: false,
      } as UserConfig,
      description: 'generate axios client',
      name: 'v3_axios',
    },
    {
      config: {
        ...config,
        client: 'xhr',
        enums: false,
        schemas: false,
        services: false,
        types: false,
      } as UserConfig,
      description: 'generate xhr client',
      name: 'v3_xhr',
    },
    {
      config: {
        ...config,
        exportCore: false,
        schemas: false,
        services: false,
        types: {
          dates: true,
          include: '^ModelWithPattern',
        },
      } as UserConfig,
      description: 'generate Date types',
      name: 'v3_date',
    },
    {
      config: {
        ...config,
        schemas: false,
        services: '^Defaults',
        types: {
          dates: true,
          include: '^ModelWithString',
        },
        useOptions: false,
      } as UserConfig,
      description: 'generate legacy positional arguments',
      name: 'v3_legacy_positional_args',
    },
    {
      config: {
        ...config,
        schemas: false,
        services: '^Defaults',
        types: {
          dates: true,
          include: '^ModelWithString',
        },
      } as UserConfig,
      description: 'generate optional arguments',
      name: 'v3_options',
    },
    {
      config: {
        ...config,
        name: 'ApiClient',
        schemas: false,
        types: {
          dates: true,
        },
      } as UserConfig,
      description: 'generate client',
      name: 'v3_client',
    },
    {
      config: {
        ...config,
        enums: 'typescript',
        schemas: false,
      } as UserConfig,
      description: 'generate TypeScript enums',
      name: 'v3_enums_typescript',
    },
    {
      config: {
        ...config,
        enums: false,
        exportCore: false,
        schemas: false,
        services: false,
      } as UserConfig,
      description: 'generate models',
      name: 'v3_models',
    },
    {
      config: {
        ...config,
        enums: false,
        exportCore: false,
        schemas: false,
        services: false,
        types: {
          include: '^(camelCaseCommentWithBreaks|ArrayWithProperties)',
          name: 'PascalCase',
        },
      } as UserConfig,
      description: 'generate pascalcase types',
      name: 'v3_pascalcase',
    },
    {
      config: {
        ...config,
        enums: false,
        exportCore: false,
        schemas: false,
        services: {
          include: '^(Simple|Parameters)',
          name: 'myAwesome{{name}}Api',
        },
        types: false,
      } as UserConfig,
      description: 'generate services with custom name',
      name: 'v3_services_name',
    },
    {
      config: {
        ...config,
        enums: false,
        exportCore: false,
        schemas: {
          type: 'json',
        },
        services: false,
        types: false,
      } as UserConfig,
      description: 'generate JSON Schemas',
      name: 'v3_schemas_json',
    },
    {
      config: {
        ...config,
        enums: false,
        exportCore: false,
        schemas: {
          type: 'form',
        },
        services: false,
        types: false,
      } as UserConfig,
      description: 'generate form validation schemas',
      name: 'v3_schemas_form',
    },
  ])('$description', async ({ name, config }) => {
    const output = toOutputPath(name);
    await createClient({
      ...config,
      input: V3_SPEC_PATH,
      output,
    });
    sync(path.resolve(output, '**/*.ts')).forEach((file) => {
      const content = readFileSync(file, { encoding: 'utf-8' }).toString();
      expect(content).toMatchFileSnapshot(toSnapshotPath(file));
    });
  });
});
