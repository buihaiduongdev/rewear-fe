import { defineConfig } from 'orval';

const input = process.env.OPENAPI_INPUT ?? './openapi/rewear.json';
const hooks = { afterAllFilesWrite: 'prettier --write' };
const mutator = {
  path: './src/shared/api/orval-request.ts',
  name: 'orvalRequest',
};

export default defineConfig({
  rewear: {
    hooks,
    input,
    output: {
      target: './src/shared/api/generated/rewear.ts',
      schemas: { path: './src/shared/api/models', mode: 'single' },
      mode: 'tags-split',
      client: 'axios-functions',
      clean: true,
      override: {
        mutator,
      },
    },
  },
  rewearQuery: {
    input,
    hooks,
    output: {
      target: './src/shared/api/query-generated/rewear.ts',
      schemas: { path: './src/shared/api/models', mode: 'single' },
      mode: 'tags-split',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator },
    },
  },
  rewearZod: {
    input,
    hooks,
    output: {
      target: './src/shared/api/zod-generated/rewear.ts',
      mode: 'tags-split',
      client: 'zod',
      clean: true,
      override: { zod: { version: 4, strict: { body: true } } },
    },
  },
});
