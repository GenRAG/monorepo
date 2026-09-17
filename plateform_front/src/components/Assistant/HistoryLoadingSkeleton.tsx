import React from "react";
import { Skeleton, Stack, VStack } from "@chakra-ui/react";

const HistoryLoadingSkeleton: React.FC = () => {
    const skeletonProps = { borderRadius: "12px" };

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
