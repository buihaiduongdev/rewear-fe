import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

const getLayerDirectories = (layer) =>
  readdirSync(join(import.meta.dirname, 'src', layer), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const isolateLayerDirectories = (layer) =>
  getLayerDirectories(layer).map((directory) => ({
    target: `./src/${layer}/${directory}`,
    from: `./src/${layer}`,
    except: [directory],
    message: `${layer}/${directory} cannot import another ${layer} directory.`,
  }));

const architectureZones = [
  {
    target: './src/shared',
    from: ['./src/app', './src/features', './src/modules'],
    message: 'shared can only depend on shared code.',
  },
  {
    target: './src/modules',
    from: ['./src/app', './src/features'],
    message: 'modules can only depend on shared code.',
  },
  {
    target: './src/features',
    from: './src/app',
    message: 'features cannot depend on app code.',
  },
  ...isolateLayerDirectories('features'),
  ...isolateLayerDirectories('modules'),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: 'postline/architecture',
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          basePath: import.meta.dirname,
          zones: architectureZones,
        },
      ],
      'import/no-unresolved': 'error',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
