import { HStack, Text, VStack } from "@chakra-ui/react";
import { GlassPanel } from "components/ui/GlassPanel";

interface AgentDatasetsSectionProps {
    title: string;
    count: number;
    children: React.ReactNode;
}

export const AgentDatasetsSection = ({ title, count, children }: AgentDatasetsSectionProps) => (
    <VStack align="stretch" spacing={3}>
        <HStack spacing={2}>
            <Text variant="caption-xs-semibold" color="textLabel" textTransform="uppercase" letterSpacing="0.06em">
                {title}
            </Text>
            <GlassPanel borderRadius="full" px={2} py={0.5} lineHeight="1">
                <Text variant="caption-xs-semibold">{count}</Text>
            </GlassPanel>
        </HStack>
        {children}
    </VStack>
);
