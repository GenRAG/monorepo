import { AppNodeData } from "lib/type/app-node";
import { Task } from "lib/type/task";
import { VStack, Text, Button, useColorModeValue } from "@chakra-ui/react";

interface SettingPlaceholderContentProps {
    task: Task;
    nodeData: AppNodeData;
    onSelect: (item: string) => void;
}

export default function SettingPlaceholderContent({
    nodeData,
    onSelect,
}: SettingPlaceholderContentProps) {
    const configItems = (nodeData.configItems as string[]) || [];
    const settingLabel = (nodeData.settingLabel as string) || "Setting";
    const labelColor = useColorModeValue("grey.600", "grey.400");
    const hoverBg = useColorModeValue("grey.100", "grey.700");

    return (
        <VStack p={4} spacing={4} align="stretch">
            <Text fontSize="sm" color={labelColor}>
                Choisissez une option pour {settingLabel}
            </Text>
            <VStack spacing={2} align="stretch">
                {configItems.map((item: string) => (
                    <Button
                        key={item}
                        variant="outline"
                        size="sm"
                        w="100%"
                        justifyContent="flex-start"
                        _hover={{ bg: hoverBg }}
                        onClick={() => {
                            onSelect(item);
                        }}
                    >
                        {item}
                    </Button>
                ))}
            </VStack>
        </VStack>
    );
}
