import { Heading, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { WorkspaceStats } from "types/workspace";

interface DashboardHeaderProps {
    name: string;
    stats: WorkspaceStats | undefined;
}

export const DashboardHeader = ({ name, stats }: DashboardHeaderProps) => {
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    return (
        <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "flex-end" }}
            gap={3}
            mb={8}
        >
            <VStack align="start" spacing={1}>
                <Heading variant="heading-md" color="textLabel" fontWeight="md" fontSize={{ base: "sm", md: "md" }}>
                    {new Date().toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </Heading>
                <Heading
                    variant="heading-3xl"
                    color="textPrimary"
                    fontWeight="semibold"
                    fontSize={{ base: "xl", md: "3xl" }}
                >
                    Bonjour {name}
                </Heading>
                {stats ? (
                    <Text variant="body-sm-muted">
                        {`${stats.agents.total} agent${stats.agents.total > 1 ? "s" : ""} / ${stats.agents.production} en production / ${stats.documents.indexed} document${stats.documents.indexed > 1 ? "s" : ""} indexé${stats.documents.indexed > 1 ? "s" : ""}`}
                    </Text>
                ) : (
                    <Skeleton height="17px" width="320px" maxW="80vw" borderRadius="4px" {...skeletonProps} />
                )}
            </VStack>
        </Stack>
    );
};
