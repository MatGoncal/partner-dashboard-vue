import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

import quality from './eslint-rules/index.cjs';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'api-mock/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,vue,mjs,cjs}'],
    plugins: { quality },
    rules: {
      // 0 violações (medir 2026-09-04)
      'quality/max-lines': ['error', { max: 400 }],
      // 0 violações. Sem logger dedicado neste frontend — nenhum arquivo isento.
      'quality/no-direct-console': 'error',
      // quality/no-direct-data-access: pulada — frontend puro consome API HTTP, sem camada de banco.
    },
  },
  {
    files: ['eslint-rules/**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'readonly', require: 'readonly' },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
