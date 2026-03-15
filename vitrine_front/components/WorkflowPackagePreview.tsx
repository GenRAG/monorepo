"use client";

import { WorkflowBuilder } from "@genrag/workflow";
import {
  ChakraProvider,
  DarkMode,
  extendTheme,
  LightMode,
} from "@genrag/workflow/node_modules/@chakra-ui/react";
import { ReactFlowProvider } from "@genrag/workflow/node_modules/@xyflow/react";

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

interface WorkflowPackagePreviewProps {
  isDark: boolean;
}

export function WorkflowPackagePreview({ isDark }: WorkflowPackagePreviewProps) {
  return (
    <div className="workflow-preview-no-dots" style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <ChakraProvider theme={workflowTheme}>
        <ReactFlowProvider>
          {isDark ? (
            <DarkMode>
              <WorkflowBuilder interactive={false} />
            </DarkMode>
          ) : (
            <LightMode>
              <WorkflowBuilder interactive={false} />
            </LightMode>
          )}
        </ReactFlowProvider>
      </ChakraProvider>

      <style jsx global>{`
        .workflow-preview-no-dots .react-flow__background {
          display: none;
        }
      `}</style>
    </div>
  );
}
