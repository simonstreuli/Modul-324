const js = require('@eslint/js');
const globals = require('globals');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.jest,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: 'warn',
      curly: 'warn',
    },
  },
  eslintPluginPrettierRecommended,
];
