import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'

const noImportFrom = (...layers) =>
  layers.flatMap((layer) => [
    { group: [`@/${layer}`, `@/${layer}/**`], message: `Esta camada não pode importar de "${layer}".` },
    { group: [`**/../${layer}`, `**/../${layer}/**`], message: `Esta camada não pode importar de "${layer}".` },
  ])

const featureInternals = {
  group: ['@/features/*/**'],
  message: 'Importe outra feature só pela API pública: "@/features/<nome>".',
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: noImportFrom('app', 'features', 'modules') }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [...noImportFrom('app', 'modules'), featureInternals] },
      ],
    },
  },
  {
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...noImportFrom('app'), featureInternals] }],
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: ['src/app/router/router.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  prettier,
])
