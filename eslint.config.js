// @ts-nocheck
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import eslintImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: [ 'dist', '**/node_modules/**' ] },
  {
    files: [ '**/*.{ts,tsx}' ],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      prettierConfig
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json', // Change this line to point directly to tsconfig.app.json
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      'eslint-import': eslintImport,
      prettier
    },
    rules: {
      'prettier/prettier': 'error',
      ...reactHooks.configs.recommended.rules,
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': [ 'error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' } ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [ 'error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' } ],
      '@typescript-eslint/consistent-type-definitions': [ 'error', 'type' ],
      '@typescript-eslint/array-type': [ 'error', { default: 'array' } ],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description' },
      ],

      // React best practices
      'react/prop-types': 'off', // TypeScript handles prop types
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-useless-fragment': 'warn',
      'react/self-closing-comp': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-key': [ 'error', { 'checkFragmentShorthand': true } ],
      'react/no-array-index-key': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-danger': 'warn',
      'react/jsx-curly-brace-presence': [ 'error', { 'props': 'never', 'children': 'never' } ],

      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [ 'warn', { 'allowConstantExport': true } ],

      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/img-redundant-alt': 'error',

      // General best practices
      'require-atomic-updates': 'error',
      'default-case-last': 'error',
      'dot-notation': 'error',
      'eqeqeq': [ 'error', 'always', { null: 'ignore' } ],
      'spaced-comment': [ 'error', 'always', { markers: [ '/' ] } ],
      'prefer-const': [ 'error', { destructuring: 'all' } ],
      'prefer-template': 'error',
      'no-console': [ 'warn', { 'allow': [ 'warn', 'error' ] } ],
      'no-alert': 'error',
      'no-var': 'error',
      'no-constant-condition': [ 'error', { 'checkLoops': false } ],
      'no-debugger': 'warn',
      'no-template-curly-in-string': 'warn',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-implicit-coercion': 'error',
      'no-nested-ternary': 'warn',
      'no-param-reassign': 'error',
      'no-throw-literal': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-concat': 'error',
      'no-return-await': 'error',
      'no-unused-expressions': 'error',
      'no-unexpected-multiline': 'error',

      // Error prevention
      'no-duplicate-imports': 'error',
      'no-invalid-regexp': 'error',
      'array-callback-return': 'error',
      'no-promise-executor-return': 'error',
      'no-useless-catch': 'error',
      'no-await-in-loop': 'error',
      'no-constructor-return': 'error',
      'no-self-compare': 'error',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [ 'error' ],
      'curly': [ 'error', 'multi-line', 'consistent' ],

      // Imports
      'eslint-import/no-default-export': 'off', // Allow default exports
      'eslint-import/order': [ 'error', {
        'groups': [ 'builtin', 'external', 'internal', 'parent', 'sibling', 'index' ],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      } ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    // JavaScript configuration for config files
    files: [ 'eslint.config.js' ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node }
    },
    plugins: {
      'eslint-import': eslintImport,
    },
    rules: {
      // Only keep essential rules for config files
      'no-console': [ 'warn', { allow: [ 'warn', 'error' ] } ],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': [ 'error', 'always', { null: 'ignore' } ],
      'curly': [ 'error', 'multi-line', 'consistent' ],
      'spaced-comment': [ 'error', 'always', { markers: [ '/' ] } ],
      'eol-last': [ 'error', 'always' ],

      // Disable import-related rules for this file
      'eslint-import/no-commonjs': 'off',
      'eslint-import/no-anonymous-default-export': 'off'
    }
  }
);
