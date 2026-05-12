"use client";

import {
  WorkflowCanvas,
  makeFlowNode,
  linkNodes,
  withAutoSettings,
  TaskType,
} from "@genrag/workflow";
import {
  ChakraProvider,
  DarkMode,
  LightMode,
  extendTheme,
} from "@chakra-ui/react";

interface WorkflowPackagePreviewProps {
  isDark: boolean;
}

const workflowTheme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    grey: {
      50: "#F6F6F6",
      100: "#E7E7E7",
      200: "#D1D1D1",
      300: "#B0B0B0",
      400: "#8F8F8F",
      500: "#6D6D6D",
      600: "#5D5D5D",
      700: "#4F4F4F",
      800: "#3D3D3D",
      850: "#2E2E2E",
      900: "#262626",
      950: "#1E1E1E",
      975: "#111111",
    },
    green: {
      50: "#ECFDF9",
      100: "#D1FAEF",
      200: "#A8F3DF",
      300: "#6EE7C7",
      400: "#34D3A9",
      500: "#12B98C",
      600: "#07966F",
      700: "#047859",
      800: "#076048",
      900: "#064E3B",
      950: "#012C21",
    },
  },
});

const { nodes: SHOWCASE_NODES, edges: SHOWCASE_EDGES } = withAutoSettings(
  [
    makeFlowNode("__sq", TaskType.QUERY, 0, 0),
    makeFlowNode("__sw", TaskType.REWRITER, 0, 200),
    makeFlowNode("__sr", TaskType.RETRIEVER, 400, 280),
    makeFlowNode("__sk", TaskType.RERANKER, 0, 450),
    makeFlowNode("__ss", TaskType.RESPONSE, 360, 550),
  ],
  [
    linkNodes("__sq", "__sw"),
    linkNodes("__sw", "__sr"),
    linkNodes("__sr", "__sk"),
    linkNodes("__sk", "__ss"),
  ],
  {
    __sw: { "Large Language Model": "Mistral" },
    __sk: { ReRanking: "BGE" },
    __ss: {
      "Large Language Model": "GPT-4o",
      "Instruction Prompt":
        "Answer only with retrieved HR context, cite policy sections, and ask for clarification when information is missing.",
    },
  },
);

export function WorkflowPackagePreview({ isDark }: WorkflowPackagePreviewProps) {
  const ModeWrapper = isDark ? DarkMode : LightMode;

  return (
    <div
      className="workflow-preview-no-dots"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: isDark ? "#50474700" : "#F6F6F6",
      }}
    >
      <ChakraProvider theme={workflowTheme}>
        <ModeWrapper>
          <WorkflowCanvas
            readonly
            initialNodes={SHOWCASE_NODES}
            initialEdges={SHOWCASE_EDGES}
            colorMode={isDark ? "dark" : "light"}
            style={{ background: "transparent" }}
            fitViewOptions={{ padding: 0.12, minZoom: 0.35, maxZoom: 2 }}
          />
        </ModeWrapper>
      </ChakraProvider>
    </div>
  );
}
