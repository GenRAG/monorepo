import {
    Box,
    HStack,
    Skeleton,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import Button from "components/System/Atoms/Button";
import { useIsDark } from "hooks/useIsDark";
import { Copy, Download } from "lucide-react";
import { useGetWorkflowByVersionQuery } from "services/workflow/workflow";

interface PipelineJsonPanelProps {
    workflowVersion: number | null;
    workspaceId: string;
    agentId: string;
}

const highlightJson = (json: object, isDark: boolean): string => {
    const escaped = JSON.stringify(json, null, 2)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return escaped.replace(
        /("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    return `<span style="color:var(--chakra-colors-green-500)">${match}</span>`;
                }
                const greenColor = isDark
                    ? "var(--chakra-colors-green-200)"
                    : "var(--chakra-colors-green-700)";
                return `<span style="color:${greenColor}">${match}</span>`;
            }
            if (/true|false/.test(match)) {
                return `<span style="color:#FF79C6">${match}</span>`;
            }
            if (/null/.test(match)) {
                return `<span style="color:var(--chakra-colors-grey-500)">${match}</span>`;
            }
            return `<span style="color:#FFB86C">${match}</span>`;
        },
    );
};

export const PipelineJsonPanel = ({
    workflowVersion,
    workspaceId,
    agentId,
}: PipelineJsonPanelProps) => {
    const { data: workflow, isLoading } = useGetWorkflowByVersionQuery(
        { workspaceId, agentId, version: workflowVersion! },
        { skip: workflowVersion === null },
    );
    const isDark = useIsDark();

    const bgColor = useColorModeValue("white", "grey.950");
    const textColor = useColorModeValue("grey.600", "grey.200");
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const jsonBgColor = useColorModeValue("grey.25", "grey.975");
    const fallbackTextColor = useColorModeValue("grey.300", "grey.600");

    const pipeline = workflow?.definition ?? null;

    return (
        <Box
            borderBottomRadius="12px"
            bg={bgColor}
            overflow="hidden"
            display="flex"
            flexDirection="column"
            h="full"
        >
            <HStack
                justify="space-between"
                p={4}
                borderBottom="1px solid"
                borderTop="1px solid"
                borderColor={borderColor}
            >
                <Text fontSize="lg" textTransform="uppercase" color={textColor}>
                    Pipeline JSON
                    {workflowVersion !== null && (
                        <Box as="span" ml={2} color="green.500">
                            · workflow v{workflowVersion}
                        </Box>
                    )}
                </Text>
                <HStack spacing={2}>
                    <Button size="sm" variant="outline" leftIcon={Download}>
                        Télécharger
                    </Button>
                    <Button size="sm" variant="outline" leftIcon={Copy}>
                        Copier
                    </Button>
                </HStack>
            </HStack>
            <Box
                p={5}
                bg={jsonBgColor}
                flex="1"
                maxW="100%"
                overflowY="scroll"
                overflowX="hidden"
            >
                {isLoading ? (
                    <Skeleton h="200px" borderRadius="6px" />
                ) : pipeline ? (
                    <Box
                        as="pre"
                        whiteSpace="pre-wrap"
                        wordBreak="break-word"
                        fontFamily="'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
                        fontSize="sm"
                        color={textColor}
                        dangerouslySetInnerHTML={{
                            __html: highlightJson(pipeline as object, isDark),
                        }}
                    />
                ) : (
                    <Text fontSize="sm" color={fallbackTextColor}>
                        Aucun workflow associé à ce déploiement.
                    </Text>
                )}
            </Box>
        </Box>
    );
};
