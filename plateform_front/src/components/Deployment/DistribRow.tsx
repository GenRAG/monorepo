import { Box, HStack, VStack, Text, useColorModeValue } from "@chakra-ui/react";
import Button from "components/System/Atoms/Button";
import { LucideIcon } from "lucide-react";

interface DistribRowProps {
    icon: LucideIcon;
    label: string;
    value: string;
    actionLabel: string;
}

export const DistribRow = ({
    icon,
    label,
    value,
    actionLabel,
}: DistribRowProps) => {
    const iconBackground = useColorModeValue("grey.50", "grey.800");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    return (
        <HStack
            justify="space-between"
            borderBottom="1px solid"
            borderBottomColor={borderColor}
            _last={{ borderBottom: "none" }}
            p={4}
        >
            <HStack spacing={3}>
                <Box
                    p={2}
                    bg={iconBackground}
                    borderRadius="4px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <Box as={icon} boxSize={4} />
                </Box>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="sm">{label}</Text>
                    <Text fontSize="xs">{value}</Text>
                </VStack>
            </HStack>
            <Button size="sm" variant="outline">
                {actionLabel}
            </Button>
        </HStack>
    );
};
