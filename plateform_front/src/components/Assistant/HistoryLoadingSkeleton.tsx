import React from "react";
import { Skeleton, Stack, VStack, useColorMode } from "@chakra-ui/react";

const HistoryLoadingSkeleton: React.FC = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const skeletonProps = {
        startColor: isDark ? "grey.800" : "grey.100",
        endColor: isDark ? "grey.700" : "grey.200",
        borderRadius: "12px",
    };

    return (
        <VStack spacing={4} align="stretch">
            <Stack spacing={2}>
                <Skeleton height="50px" w="70%" ml="auto" {...skeletonProps} />
                <Skeleton height="35px" w="50%" ml="auto" {...skeletonProps} />
            </Stack>
            <Skeleton height="60px" w="70%" {...skeletonProps} />
            <Skeleton height="60px" w="70%" ml="auto" {...skeletonProps} />
            <Skeleton height="90px" w="70%" {...skeletonProps} />
            <Skeleton height="40px" w="70%" ml="auto" {...skeletonProps} />
            <Stack spacing={2}>
                <Skeleton height="50px" w="70%" {...skeletonProps} />
                <Skeleton height="35px" w="50%" {...skeletonProps} />
            </Stack>
            <Skeleton height="60px" w="70%" ml="auto" {...skeletonProps} />
            <Skeleton height="60px" w="70%" {...skeletonProps} />
            <Skeleton height="90px" w="70%" ml="auto" {...skeletonProps} />
        </VStack>
    );
};

export default HistoryLoadingSkeleton;
