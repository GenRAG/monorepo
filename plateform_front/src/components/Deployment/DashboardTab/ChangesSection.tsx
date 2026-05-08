import { Badge, Box, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import SectionHeader from "components/Deployment/SectionHeader";
import { Cpu, GitBranch, Settings } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { WorkflowNodeTypes } from "types/workflow/workflow";

interface Change {
    icon: LucideIcon;
    type: string;
    description: string;
    date: string;
}

const CHANGES: Change[] = [
    {
        icon: GitBranch,
        type: WorkflowNodeTypes.WORKFLOW,
        description: "Nœud RERANKER ajouté",
        date: "il y a 2h",
    },
    {
        icon: Settings,
        type: WorkflowNodeTypes.PARAMETRE,
        description: "Prompt système modifié",
        date: "il y a 5h",
    },
    {
        icon: Cpu,
        type: WorkflowNodeTypes.MODELE,
        description: "LLM RESPONSE → GPT-4o",
        date: "hier",
    },
];

const TYPE_COLORS: Record<string, { bg: string }> = {
    [WorkflowNodeTypes.WORKFLOW]: { bg: "green" },
    [WorkflowNodeTypes.PARAMETRE]: { bg: "red" },
    [WorkflowNodeTypes.MODELE]: { bg: "blue" },
};

export const ChangesSection = () => {
    const bgContainer = useColorModeValue("white", "grey.900");
    const tagBg = useColorModeValue("grey.50", "grey.800");
    const iconBackground = useColorModeValue("grey.50", "grey.800");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    return (
        <Box
            bg={bgContainer}
            border="0.5px solid"
            borderColor={borderColor}
            borderRadius="12px"
            overflow="hidden"
        >
            <SectionHeader
                title="Changelog"
                subtitle="Suivez les dernières modifications apportées à votre assistant."
            />

            {CHANGES.map((change, i) => {
                const typeStyle = TYPE_COLORS[change.type] ?? {
                    bg: tagBg,
                    color: "textMuted",
                };
                return (
                    <HStack
                        key={change.description}
                        p={4}
                        spacing={5}
                        borderBottom={
                            i < CHANGES.length - 1 ? "0.5px solid" : undefined
                        }
                        borderColor={borderColor}
                        align="center"
                    >
                        <Box
                            p={2}
                            bg={iconBackground}
                            borderRadius="4px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                        >
                            <Box as={change.icon} boxSize={4} />
                        </Box>
                        <Badge
                            colorScheme={typeStyle.bg}
                            fontSize="10px"
                            fontWeight="medium"
                        >
                            {change.type}
                        </Badge>
                        <Text fontSize="sm" fontWeight="medium" flex={1}>
                            {change.description}
                        </Text>
                        <Text fontSize="sm" color="textMuted" flexShrink={0}>
                            {change.date}
                        </Text>
                    </HStack>
                );
            })}
        </Box>
    );
};

export default ChangesSection;
