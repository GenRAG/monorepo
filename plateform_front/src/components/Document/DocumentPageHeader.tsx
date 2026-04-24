import React from "react";
import {
    Box,
    HStack,
    IconButton,
    SimpleGrid,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { ArrowUpDown } from "lucide-react";
import { DocumentRouteParams } from "types/document/document";
import { useGetAgentDocumentStatsQuery } from "services/document/document";
import { StatCard } from "./StatCard";
import { StorageOverviewPanel } from "./StorageOverviewPanel";

type DocumentPageHeaderProps = DocumentRouteParams;

export const DocumentPageHeader: React.FC<DocumentPageHeaderProps> = ({
    workspaceId,
    agentId,
}) => {
    const { data: stats } = useGetAgentDocumentStatsQuery({ workspaceId, agentId });

    const formatSize = (bytes: number) => {
        if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(0)} KB`;
        return `${(bytes / 1_000_000).toFixed(1)} MB`;
    };

    const totalSize = Object.values(stats?.sizeByMimeType ?? {}).reduce(
        (acc, s) => acc + s,
        0,
    );
    const panelBg = useColorModeValue("white", "grey.975");
    const panelBorder = useColorModeValue("grey.100", "grey.700");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const textPrimary = useColorModeValue("grey.900", "white");

    return (
        <>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <StatCard label="Total" value={stats?.total ?? 0} />
                <StatCard label="Indexés" value={stats?.indexed ?? 0} accent />
                <StatCard label="En traitement" value={stats?.processing ?? 0} />
                <StatCard label="Taille totale" value={formatSize(totalSize)} />
            </SimpleGrid>
            <SimpleGrid w="100%" spacing={4} display={{ base: "none", md: "grid" }}>
                <Box
                    bg={panelBg}
                    w="100%"
                    border="1px solid"
                    borderColor={panelBorder}
                    borderRadius="14px"
                    p={5}
                    display="flex"
                    flexDirection="column"
                >
                    <HStack
                        w="100%"
                        justify="space-between"
                        mb={4}
                        flexShrink={0}
                    >
                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            color={textPrimary}
                        >
                            Vue d&apos;ensemble du stockage
                        </Text>
                        <IconButton
                            aria-label="sort"
                            icon={<ArrowUpDown size={14} />}
                            size="xs"
                            variant="ghost"
                            color={labelColor}
                        />
                    </HStack>
                    <Box flex={1} minH={0}>
                        <StorageOverviewPanel stats={stats ?? null} />
                    </Box>
                </Box>
            </SimpleGrid>
        </>
    );
};
