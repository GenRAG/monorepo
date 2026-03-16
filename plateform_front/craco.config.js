import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const workflowSrc = resolve(__dirname, "../packages/workflow/src");

export const webpack = {
  alias: {
    "@genrag/workflow": resolve(__dirname, "../packages/workflow/src/index.ts"),
    react: resolve(__dirname, "node_modules/react"),
    "react-dom": resolve(__dirname, "node_modules/react-dom"),
    "@xyflow/react": resolve(__dirname, "node_modules/@xyflow/react"),
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
