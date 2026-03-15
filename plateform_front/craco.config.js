import { resolve } from "path";

const workflowSrc = resolve(__dirname, "../packages/workflow/src");

export const webpack = {
  configure: (webpackConfig) => {
    const oneOfRule = webpackConfig.module.rules.find((rule) =>
      Array.isArray(rule.oneOf),
    );

    if (!oneOfRule) {
      return webpackConfig;
    }

    const babelRule = oneOfRule.oneOf.find(
      (rule) => rule.loader && rule.loader.includes("babel-loader"),
    );

    if (babelRule) {
      const include = Array.isArray(babelRule.include)
        ? babelRule.include
        : [babelRule.include].filter(Boolean);

      if (!include.includes(workflowSrc)) {
        babelRule.include = [...include, workflowSrc];
      }
    }

    return webpackConfig;
  },
};
