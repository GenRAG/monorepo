import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

function downgradeRulesToWarn(config) {
    if (!config?.rules) return config;
    const downgraded = { ...config };
    downgraded.rules = Object.fromEntries(
        Object.entries(config.rules).map(([rule, value]) => {
            if (value === 'error') return [rule, 'warn'];
            if (Array.isArray(value) && value[0] === 'error') {
                return [rule, ['warn', ...value.slice(1)]];
            }
            return [rule, value];
        })
    );
    return downgraded;
}

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs', 'dist', 'node_modules'],
    },
    downgradeRulesToWarn(eslint.configs.recommended),
    ...tseslint.configs.recommendedTypeChecked.map(downgradeRulesToWarn),
    downgradeRulesToWarn(eslintPluginPrettierRecommended),
    {
        languageOptions: {
            parser: tseslint.parser,
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            indent: ['off'],
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'prettier/prettier': ['warn', { tabWidth: 4, useTabs: false, printWidth: 120 }],
        },
    },
);
