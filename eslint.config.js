import { defineConfig } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default defineConfig([
    {
        ignores: [
            '**/node_modules/**',
            '**/.pnpm-store/**',
            '**/dist/**',
            '**/build/**',
            '**/.turbo/**',
            '**/*.tsbuildinfo',
            '**/pnpm-lock.yaml',
            '**/package-lock.json',
            '**/yarn.lock',
            '**/.agents/**',
            '**/.changeset/**',
            '**/coverage/**',
            '**/.DS_Store',
        ],
    },
    ...compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier'
    ),
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]);
