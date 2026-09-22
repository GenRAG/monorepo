import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";

interface ActivityLegendProps {
    showCredits?: boolean;
    creditsColor?: string;
}

export const ActivityLegend = ({ showCredits = false, creditsColor }: ActivityLegendProps) => {
    return (
        <HStack p={4} spacing={4} borderTop="1px solid" borderColor="borderDefault" flexWrap="wrap">
            <HStack spacing={1.5}>
                <Box w="8px" h="8px" borderRadius="2px" bg="iconAccent" flexShrink={0} />
                <Text variant="body-xs-muted">Conversations</Text>
            </HStack>
            {showCredits && (
                <HStack spacing={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg={creditsColor} flexShrink={0} />
                    <Text variant="body-xs-muted">Crédits utilisés</Text>
                </HStack>
            )}
            <HStack spacing={1.5}>
                <Icon as={Info} boxSize={3} color="textLabel" />
                <Text variant="body-xs-muted">Hors trafic interne et tests</Text>
            </HStack>
        </HStack>
    );
};
