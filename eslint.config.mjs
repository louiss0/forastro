// eslint.config.js (flat)
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import nxPlugin from '@nx/eslint-plugin';

export default [
  {
    ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', 'docs/**/node_modules/**'],
  },
  // General rules (including Nx)
  {
    plugins: { '@nx': nxPlugin },
    rules: {
      // Disable module boundary fixer that breaks on Windows with wildcard tsconfig paths
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  // TypeScript rules
  {
    files: ['**/*.ts', '**/*.tsx'] ,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  // Test file relaxations
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    },
  },
  // Ignore/relax for generated declaration files
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    }
  },
  // Astro files
  ...astro.configs.recommended,
  // Prettier last to disable conflicting rules
  prettier,
];
