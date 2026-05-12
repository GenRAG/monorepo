import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const currentDir = dirname(fileURLToPath(import.meta.url));

const workflowSrc = resolve(currentDir, "../packages/workflow/src");

export const webpack = {
  alias: {
    "@genrag/workflow": resolve(currentDir, "../packages/workflow/src/index.ts"),
    react: resolve(currentDir, "node_modules/react"),
    "react-dom": resolve(currentDir, "node_modules/react-dom"),
    "@xyflow/react": resolve(currentDir, "node_modules/@xyflow/react"),
    "@chakra-ui/react": resolve(currentDir, "node_modules/@chakra-ui/react"),
    "@emotion/react": resolve(currentDir, "node_modules/@emotion/react"),
    "@emotion/styled": resolve(currentDir, "node_modules/@emotion/styled"),
    "framer-motion": resolve(currentDir, "node_modules/framer-motion"),
  },
  configure: (webpackConfig) => {
    webpackConfig.resolve.plugins = (
      webpackConfig.resolve.plugins || []
    ).filter(
      (plugin) =>
        plugin.constructor && plugin.constructor.name !== "ModuleScopePlugin",
    );

    const oneOfRule = webpackConfig.module.rules.find((rule) =>
      Array.isArray(rule.oneOf),
    );

    if (!oneOfRule) {
      return webpackConfig;
    }

    const babelRules = oneOfRule.oneOf.filter(
      (rule) =>
        (rule.loader && rule.loader.includes("babel-loader")) ||
        (Array.isArray(rule.use) &&
          rule.use.some((u) => u.loader && u.loader.includes("babel-loader"))),
    );

    babelRules.forEach((babelRule) => {
      const include = Array.isArray(babelRule.include)
        ? babelRule.include
        : [babelRule.include].filter(Boolean);

      if (
        !include.some(
          (p) =>
            p === workflowSrc ||
            (p && p.toString && p.toString().includes("packages/workflow")),
        )
      ) {
        babelRule.include = [...include, workflowSrc];
      }
    });

    return webpackConfig;
  },
};
