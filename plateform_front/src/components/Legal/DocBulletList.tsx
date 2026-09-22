import { VStack, HStack, Box, Text } from "@chakra-ui/react";

interface DocBulletListProps {
    items: string[];
}

export const DocBulletList = ({ items }: DocBulletListProps) => {
    return (
        <VStack align="start" spacing={2.5}>
            {items.map((item, i) => (
                <HStack key={i} align="start" spacing={3}>
                    <Box w="5px" h="5px" borderRadius="full" bg="iconAccent" flexShrink={0} mt="8px" />
                    <Text fontSize="sm" color="textBody" lineHeight={1.7}>
                        {item}
                    </Text>
                </HStack>
            ))}
        </VStack>
    );
};
