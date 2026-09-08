import { Box, Card, Divider, Grid, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { BarChart3, FileText, GitGraph, MessageCircle, type LucideIcon } from "lucide-react";

interface QuickLinksCardProps {
    workspaceId: string;
    agentId: string;
}

interface QuickLink {
    id: string;
    icon: LucideIcon;
    label: string;
    description: string;
}

const LINKS: QuickLink[] = [
    { id: "playground", icon: MessageCircle, label: "Playground", description: "Tester l'agent" },
    { id: "documents", icon: FileText, label: "Documents", description: "Base documentaire" },
    { id: "workflow", icon: GitGraph, label: "Architecture", description: "Éditer le pipeline" },
    { id: "analytics", icon: BarChart3, label: "Analytics", description: "Suivre l'utilisation" },
];

export const QuickLinksCard = ({ workspaceId, agentId }: QuickLinksCardProps) => (
    <Stack spacing={0} h="100%">
        <Card variant="attachedTop" size="sm">
            <VStack align="flex-start" spacing={0}>
                <Text variant="body-md-semibold">Accès rapides</Text>
                <Text variant="body-xs-muted">Naviguez directement vers les autres espaces de l&apos;agent</Text>
            </VStack>
        </Card>
        <Divider borderColor="borderStrong" />
        <Card variant="attachedBottom" size="none" flex={1}>
            <Grid templateColumns="repeat(2, 1fr)">
                {LINKS.map((link, i) => (
                    <HStack
                        as={RouterLink}
                        key={link.id}
                        to={`/workspaces/${workspaceId}/agents/${agentId}/${link.id}`}
                        p={4}
                        spacing={3}
                        align="flex-start"
                        borderBottom={i < LINKS.length - 2 ? "1px solid" : undefined}
                        borderRight={i % 2 === 0 ? "1px solid" : undefined}
                        borderColor="borderDefault"
                        _hover={{ bg: "surfaceSubtle" }}
                        transition="background 0.12s"
                    >
                        <Box as={link.icon} boxSize={4} color="green.500" flexShrink={0} mt={0.5} />
                        <VStack align="flex-start" spacing={0} minW={0}>
                            <Text variant="body-sm-semibold" noOfLines={1}>
                                {link.label}
                            </Text>
                            <Text variant="body-xs-muted" noOfLines={1}>
                                {link.description}
                            </Text>
                        </VStack>
                    </HStack>
                ))}
            </Grid>
        </Card>
    </Stack>
);

export default QuickLinksCard;
