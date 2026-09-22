import { Box } from "@chakra-ui/react";

interface StepProgressBarProps {
    step: number;
    progress: number;
    stepCount: number;
    isInitialized: boolean;
    borderRadius?: string;
}

export const StepProgressBar = ({
    step,
    progress,
    stepCount,
    isInitialized,
    borderRadius = "18px",
}: StepProgressBarProps) => (
    <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="4px"
        w="100%"
        bg="grey.300"
        borderRadius={borderRadius}
        overflow="hidden"
    >
        <Box
            h="100%"
            w={`${((step + progress / 100) / stepCount) * 100}%`}
            bg="green.500"
            transition={isInitialized ? "width 0.1s linear" : "none"}
        />
    </Box>
);
