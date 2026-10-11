import { Skeleton, Stack } from "@chakra-ui/react";

export const DatasetLibrarySkeleton = () => (
    <Stack spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} h="52px" borderRadius="8px" />
        ))}
    </Stack>
);
