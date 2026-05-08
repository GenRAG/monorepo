import { Box, HStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { Info } from "lucide-react";

export const ActivityLegend = () => {
    const border = useColorModeValue("grey.100", "grey.800");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    return (
        <HStack p={4} spacing={4} borderTop="1px solid" borderColor={border}>
            <HStack spacing={1.5}>
                <Box
                    w="8px"
                    h="8px"
                    borderRadius="2px"
                    bg="green.500"
                    flexShrink={0}
                />
                <Text fontSize="12px" color={textSecondary}>
                    Conversations
                </Text>
            </HStack>
            <HStack spacing={1.5}>
                <Icon as={Info} boxSize={3} color={textSecondary} />
                <Text fontSize="xs" color={textSecondary}>
                    Hors trafic interne et tests
                </Text>
            </HStack>
        </HStack>
    );
};
