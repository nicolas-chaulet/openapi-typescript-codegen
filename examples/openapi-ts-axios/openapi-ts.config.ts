import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  base: 'https://petstore3.swagger.io/api/v3',
  client: '@hey-api/client-axios',
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  // 'https://raw.githubusercontent.com/Redocly/museum-openapi-example/main/openapi.yaml',
  // '../../packages/openapi-ts/test/spec/v3.json',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/client',
  },
  types: {
    enums: 'javascript',
  },
});
