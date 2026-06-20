import { VStack, HStack, Text, useColorModeValue } from "@chakra-ui/react";

interface DocTableRow {
    key: string;
    value: string;
}

interface DocTableProps {
    rows: DocTableRow[];
}

export const DocTable = ({ rows }: DocTableProps) => {
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const keyColor = useColorModeValue("grey.400", "grey.500");
    const valueColor = useColorModeValue("grey.800", "grey.100");
    const rowHover = useColorModeValue("grey.50", "grey.900");

    return (
        <VStack
            align="stretch"
            spacing={0}
            borderRadius="10px"
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
        >
            {rows.map(({ key, value }, i) => (
                <HStack
                    key={i}
                    px={5}
                    py={3.5}
                    spacing={4}
                    borderBottom={i < rows.length - 1 ? "1px solid" : undefined}
                    borderColor={borderColor}
                    align="start"
                    _hover={{ bg: rowHover }}
                    transition="background 0.1s"
                >
                    <Text
                        fontSize="10px"
                        fontWeight={700}
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        color={keyColor}
                        w="180px"
                        flexShrink={0}
                        pt={0.5}
                    >
                        {key}
                    </Text>
                    <Text fontSize="sm" color={valueColor}>
                        {value}
                    </Text>
                </HStack>
            ))}
        </VStack>
    );
};
