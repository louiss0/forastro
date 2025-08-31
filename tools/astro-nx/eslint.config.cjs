const tseslint = require('typescript-eslint');
const nxPlugin = require('@nx/eslint-plugin');

module.exports = [
  // Global ignores for this package only
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'src/templates/**',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.integration.spec.ts',
      '**/*.integration.spec.tsx',
      'eslint.config.*',
      'vite.config.*',
      'vitest.config.*',
    ],
  },
  // TS sources
  {
    files: ['src/**/*.{ts,tsx,cts,mts}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@nx': nxPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Focus on this package's TS configs first, then workspace
        project: [
          './tsconfig.lib.json',
          './tsconfig.spec.json',
          '../../tsconfig.json',
          '../../tsconfig.*.json',
        ],
      },
    },
    rules: {
      // Keep consistent with your philosophy without being over-strict here
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      'prefer-const': 'error',
      '@nx/enforce-module-boundaries': ['error', {
        enforceBuildableLibDependency: true,
        allow: ['shared'],
        depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
      }],
    },
  },
  // JSON in this package
  {
    files: ['**/*.json', '!**/package.json'],
    languageOptions: { parser: require('jsonc-eslint-parser') },
    rules: {},
  },
  // Nx plugin checks for package.json
  {
    files: ['**/package.json'],
    languageOptions: { parser: require('jsonc-eslint-parser') },
    rules: {},
  },
];
