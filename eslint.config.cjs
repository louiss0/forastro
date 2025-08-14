const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');
const tseslint = require('typescript-eslint');
const astroParser = require('astro-eslint-parser');
const astroPlugin = require('eslint-plugin-astro');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  // JSON configuration
  {
    files: ['**/*.json'],
    rules: {},
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },

  // Astro files configuration
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
    plugins: {
      astro: astroPlugin,
    },
    rules: {
      ...astroPlugin.configs.recommended.rules,
      'astro/no-set-html-directive': 'error',
      'astro/no-unused-define-vars-in-style': 'error',
    },
  },

  // Global ignores
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/.astro',
    ],
  },

  // NX plugin configuration
  { plugins: { '@nx': nxEslintPlugin } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['shared'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  // Enhanced TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.*.json'],
      },
    },
    rules: {
      // Coding philosophy: Clarity & Self-Documentation
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-inferrable-types': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Variable naming and organization
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE']
        },
        {
          selector: 'function',
          format: ['camelCase']
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        }
      ],
      
      // Error handling as explicit values
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      
      // Code organization
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports'
      }],
    },
  },
  ...compat
    .config({
      extends: ['plugin:@nx/typescript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
      rules: {
        ...config.rules,
      },
    })),
  ...compat
    .config({
      extends: ['plugin:@nx/javascript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
      rules: {
        ...config.rules,
      },
    })),
];
