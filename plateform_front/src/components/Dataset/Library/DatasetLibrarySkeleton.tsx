import { Skeleton, SimpleGrid, Stack } from "@chakra-ui/react";
import { ViewMode } from "hooks/dataset/useViewModePreference";

export const DatasetLibrarySkeleton = ({ viewMode }: { viewMode: ViewMode }) =>
    viewMode === "grid" ? (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} h="160px" borderRadius="12px" />
            ))}
        </SimpleGrid>
    ) : (
        <Stack spacing={2}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} h="52px" borderRadius="8px" />
            ))}
        </Stack>
    );
