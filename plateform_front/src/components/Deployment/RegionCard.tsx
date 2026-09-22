import { Box, HStack, VStack, Text, Badge, useColorModeValue } from "@chakra-ui/react";

interface RegionCardProps {
    flag: string;
    name: string;
    description: string;
    badge?: string;
    isSelected: boolean;
    onClick: () => void;
}

export const RegionCard = ({ flag, name, description, badge, isSelected, onClick }: RegionCardProps) => {
    const bgSelectedColor = useColorModeValue("green.50", "green.950");
    const bgColor = useColorModeValue("white", "grey.900");

    const borderColorSelected = "green.500";
    const borderSelected = useColorModeValue("grey.500", "grey.200");

    const bg = isSelected ? bgSelectedColor : bgColor;
    const border = isSelected ? borderColorSelected : "borderDefault";

    return (
        <Box
            flex={1}
            p={4}
            borderRadius="10px"
            border="1.5px solid"
            borderColor={border}
            bg={bg}
            cursor="pointer"
            onClick={onClick}
            _hover={{
                borderColor: isSelected ? borderColorSelected : borderSelected,
            }}
        >
            <VStack align="start">
                <HStack justify="space-between" w="100%">
                    <Text fontSize="md">{flag}</Text>
                    {badge && (
                        <Badge colorScheme="green" title="Rec" size="xs">
                            {badge}
                        </Badge>
                    )}
                </HStack>
                <Text fontSize="sm" fontWeight={500} color="textPrimary">
                    {name}
                </Text>
                <Text fontSize="xs" color="textSubtle">
                    {description}
                </Text>
            </VStack>
        </Box>
    );
};
