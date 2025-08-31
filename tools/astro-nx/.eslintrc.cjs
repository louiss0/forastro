module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.lib.json', './tsconfig.spec.json']
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.integration.spec.ts',
    '**/*.integration.spec.tsx'
  ],
  overrides: [
    {
      files: ['src/**/*.ts'],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        'prefer-const': 'error'
      }
    }
  ]
};
