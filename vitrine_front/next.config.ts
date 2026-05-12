import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@genrag/workflow"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@genrag/workflow": path.resolve(__dirname, "../packages/workflow/src/index.ts"),
      // Deduplicate to avoid multiple React/Chakra instances
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "@chakra-ui/react": path.resolve(__dirname, "node_modules/@chakra-ui/react"),
      "@emotion/react": path.resolve(__dirname, "node_modules/@emotion/react"),
      "@emotion/styled": path.resolve(__dirname, "node_modules/@emotion/styled"),
    };
    return config;
  },
};

export default nextConfig;
