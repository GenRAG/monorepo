import { Box, Text, HStack, VStack, Flex, Tooltip, Icon, Badge, useColorModeValue } from "@chakra-ui/react";
import { Info } from "lucide-react";
import type { TaskType } from "@genrag/workflow";
import { getTaskDef } from "@genrag/workflow";
import BoxIcon from "components/ui/BoxIcon";

interface MenuNodeCardProps {
    nodeType: TaskType;
    alreadyUsed: boolean;
    isSelected: boolean;
    onClick: (type: TaskType) => void;
    tooltipContent: React.ReactNode;
}

export const MenuNodeCard = ({ nodeType, alreadyUsed, isSelected, onClick, tooltipContent }: MenuNodeCardProps) => {
    const task = getTaskDef(nodeType)!;
    const isDraggable = !alreadyUsed;

    const tooltipBg = useColorModeValue("green.50", "grey.700");

    return (
        <Box
            onClick={isDraggable ? () => onClick(nodeType) : undefined}
            bg={isSelected ? "accentCardBg" : "surfaceCard"}
            border="1px solid"
            borderColor={isSelected ? "borderAccentCardActive" : "borderAccentCardMuted"}
            borderRadius="10px"
            p={2}
            transition="all 0.15s"
            opacity={alreadyUsed ? 0.5 : 1}
            _hover={isDraggable ? { bg: "accentCardBg", borderColor: "borderAccentCardActive" } : {}}
        >
            <Flex align="center" gap={3}>
                <Box flexShrink={0}>
                    <BoxIcon icon={task.icon} />
                </Box>

                <VStack align="start" spacing={0} flex={1} minW={0}>
                    <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary" noOfLines={1}>
                            {task.label}
                        </Text>
                        {alreadyUsed && (
                            <Badge bg="borderSubtle" color="textLabel" size="sm">
                                UTILISE
                            </Badge>
                        )}
                    </HStack>
                    <Text fontSize="xs" color="textLabel" noOfLines={1}>
                        {task.description}
                    </Text>
                </VStack>

                {tooltipContent && (
                    <Tooltip
                        offset={[0, 20]}
                        boxShadow="xl"
                        bg={tooltipBg}
                        borderRadius="10px"
                        label={tooltipContent}
                        placement="right"
                        hasArrow
                        maxW="600px"
                    >
                        <Icon
                            as={Info}
                            boxSize={4}
                            cursor="pointer"
                            color="textLabel"
                            flexShrink={0}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Tooltip>
                )}
            </Flex>
        </Box>
    );
};
