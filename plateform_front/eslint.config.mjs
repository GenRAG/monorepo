import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

function downgradeRulesToWarn(config) {
  if (!config?.rules) return config;
  const downgraded = { ...config };
  downgraded.rules = Object.fromEntries(
    Object.entries(config.rules).map(([rule, value]) => {
      if (value === "error") return [rule, "warn"];
      if (Array.isArray(value) && value[0] === "error") {
        return [rule, ["warn", ...value.slice(1)]];
      }
      return [rule, value];
    })
  );
  return downgraded;
}

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "eslint.config.mts", "build", "node_modules", "public"],
  },
  downgradeRulesToWarn(eslint.configs.recommended),
  ...tseslint.configs.recommended.map(downgradeRulesToWarn),
  downgradeRulesToWarn(eslintPluginPrettierRecommended),
  downgradeRulesToWarn(pluginReact.configs.flat.recommended),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      indent: ["off"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "prettier/prettier": ["warn", { tabWidth: 4, useTabs: false, printWidth: 120 }],
    },
  }
);
