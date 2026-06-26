import { HStack, VStack, Text, useColorModeValue } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { LucideIcon } from "lucide-react";

interface DistribRowProps {
    icon: LucideIcon;
    label: string;
    value: string;
    actionLabel: string;
}

export const DistribRow = ({ icon, label, value, actionLabel }: DistribRowProps) => {
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
                <BoxIcon icon={icon} />
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="sm">{label}</Text>
                    <Text fontSize="xs">{value}</Text>
                </VStack>
            </HStack>
            <Button size="sm">{actionLabel}</Button>
        </HStack>
    );
};
