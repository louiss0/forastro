// eslint.config.js (flat)
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', 'docs/**/node_modules/**'],
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
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  // Astro files
  astro.configs.recommended,
  // Prettier last to disable conflicting rules
  prettier,
];
