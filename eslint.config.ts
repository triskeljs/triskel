
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser, ...globals.node,
      },
    },
  },
  tseslint.configs.recommended,
  {
    rules: {
      // prefer single quotes
      'quotes': ['error', 'single', { avoidEscape: true }],
      // enforce consistent indentation (2 spaces)
      'indent': ['error', 2, { SwitchCase: 1 }],
      // disallow semicolons at the end of statements
      'semi': ['error', 'never'],
      // disallow unused variables unless they start with an underscore
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // enforce consistent line breaks inside braces
      'object-curly-newline': ['error', { multiline: true, consistent: true }],
      // enforce the use of === and !== over == and !=
      'eqeqeq': ['error', 'always'],
      // disallow the use of console (except for console.warn and console.error)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // enforce a maximum line length of 100 characters
      // 'max-len': ['warn', { code: 100 }],
      // require trailing commas in multiline object and array literals
      'comma-dangle': ['error', 'always-multiline'],
      // enforce consistent spacing before and after keywords
      'keyword-spacing': ['error', { before: true, after: true }],
      // enforce consistent spacing inside curly braces
      'object-curly-spacing': ['error', 'always'],
    },
  },
  {
    files: ['**/Makefile'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-tabs': 'off',
      'indent': ['error', 'tab'],
      // indent size is 4 spaces
      'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
    },
  },
])
