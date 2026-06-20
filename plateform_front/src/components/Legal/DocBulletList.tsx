import { VStack, HStack, Box, Text, useColorModeValue } from "@chakra-ui/react";

interface DocBulletListProps {
    items: string[];
}

export const DocBulletList = ({ items }: DocBulletListProps) => {
    const textColor = useColorModeValue("grey.700", "grey.300");
    const bulletColor = useColorModeValue("green.500", "green.400");

    return (
        <VStack align="start" spacing={2.5}>
            {items.map((item, i) => (
                <HStack key={i} align="start" spacing={3}>
                    <Box w="5px" h="5px" borderRadius="full" bg={bulletColor} flexShrink={0} mt="8px" />
                    <Text fontSize="sm" color={textColor} lineHeight={1.7}>
                        {item}
                    </Text>
                </HStack>
            ))}
        </VStack>
    );
};
