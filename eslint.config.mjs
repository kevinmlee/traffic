import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import a11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**'],
  },
  // Next.js flat config (includes react and react-hooks rules)
  nextPlugin.configs['core-web-vitals'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'jsx-a11y': a11yPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',

      // General
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'prefer-const': 'error',
    },
  },
];
