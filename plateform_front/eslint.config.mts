import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { fileURLToPath } from "node:url";

function downgradeRulesToWarn(config: { rules?: Record<string, unknown> }) {
  if (!config?.rules) return config;
  const downgraded = { ...config };
  downgraded.rules = Object.fromEntries(
    Object.entries(config.rules).map(([rule, value]) => {
      if (value === "error") return [rule, "warn"];
      if (Array.isArray(value) && value[0] === "error") {
        return [rule, ["warn", ...(value as unknown[]).slice(1)]];
      }
      return [rule, value];
    })
  );
  return downgraded;
}

export default tseslint.config(
  {
    ignores: ["eslint.config.mts", "build", "node_modules", "public"],
    ...[downgradeRulesToWarn(eslint.configs.recommended)],
    ...tseslint.configs.recommendedTypeChecked.map((config) =>
      downgradeRulesToWarn({
        ...(typeof config === "object" ? config : {}),
        rules: (config as any).rules,
      })
    ),
    ...[downgradeRulesToWarn(eslintPluginPrettierRecommended)],
    ...[downgradeRulesToWarn(pluginReact.configs.flat.recommended)],
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
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
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
      "prettier/prettier": ["warn", { tabWidth: 4, useTabs: false }],
    },
  }
);
