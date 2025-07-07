module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // General code quality
    'no-console': 'off', // Allowed in Node.js
    'prefer-const': 'error',
    'no-var': 'error',
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
      ],
      rules: {
        // Disable base rule as it can report incorrect errors
        'no-unused-vars': 'off',
        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        
        // General code quality
        'no-console': 'off',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-throw-literal': 'error',
        'prefer-promise-reject-errors': 'error',
        'no-debugger': 'error',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}; 