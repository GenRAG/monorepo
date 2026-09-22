import { VStack, HStack, Text } from "@chakra-ui/react";

interface DocTableRow {
    key: string;
    value: string;
}

interface DocTableProps {
    rows: DocTableRow[];
}

export const DocTable = ({ rows }: DocTableProps) => {
    return (
        <VStack
            align="stretch"
            spacing={0}
            borderRadius="10px"
            overflow="hidden"
            border="1px solid"
            borderColor="borderDefault"
        >
            {rows.map(({ key, value }, i) => (
                <HStack
                    key={i}
                    px={5}
                    py={3.5}
                    spacing={4}
                    borderBottom={i < rows.length - 1 ? "1px solid" : undefined}
                    borderColor="borderDefault"
                    align="start"
                    _hover={{ bg: "surfaceHover" }}
                    transition="background 0.1s"
                >
                    <Text
                        fontSize="10px"
                        fontWeight={700}
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        color="textFaint"
                        w="180px"
                        flexShrink={0}
                        pt={0.5}
                    >
                        {key}
                    </Text>
                    <Text fontSize="sm" color="textPrimary">
                        {value}
                    </Text>
                </HStack>
            ))}
        </VStack>
    );
};
