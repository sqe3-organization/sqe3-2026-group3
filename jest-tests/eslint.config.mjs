// Code conventions of the team, checked by ESLint. npm run lint / npm run lint:fix
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'coverage/', 'logs/', 'reports/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      // format
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/max-len': ['warn', { code: 140, ignoreStrings: true, ignoreTemplateLiterals: true }],
      // code
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      camelcase: ['error', { properties: 'never' }],
      // the logger is used instead of console (see docs/FRAMEWORK.md)
      'no-console': 'error',
    },
  },
  {
    // helpers of the tests: they use the Jest globals but they are not test files
    files: ['tests/support/**/*.js'],
    languageOptions: { globals: { ...globals.jest } },
  },
  {
    files: ['**/*.test.js'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expect*', 'rejectedAndUnchanged'] }],
      'jest/no-standalone-expect': 'off',
    },
  },
];
