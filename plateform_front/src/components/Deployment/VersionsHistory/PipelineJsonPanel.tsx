import { Box, HStack, Skeleton, Text, useColorModeValue } from "@chakra-ui/react";
import { useIsDark } from "hooks/useIsDark";
import { useGetWorkflowByVersionQuery } from "services/workflow/workflow";

interface PipelineJsonPanelProps {
    workflowVersion: number | null;
    workspaceId: string;
    agentId: string;
    deploymentName: string | null;
    deploymentChangelog: string | null;
}

const highlightJson = (json: object, isDark: boolean): string => {
    const escaped = JSON.stringify(json, null, 2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return escaped.replace(
        /("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    return `<span style="color:var(--chakra-colors-green-500)">${match}</span>`;
                }
                const greenColor = isDark ? "var(--chakra-colors-green-200)" : "var(--chakra-colors-green-700)";
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
    deploymentName,
    deploymentChangelog,
}: PipelineJsonPanelProps) => {
    const { data: workflow, isLoading } = useGetWorkflowByVersionQuery(
        { workspaceId, agentId, version: workflowVersion ?? 0 },
        { skip: workflowVersion === null },
    );
    const isDark = useIsDark();

    const textColor = useColorModeValue("grey.600", "grey.200");

    const pipeline = workflow?.definition.blocks ?? null;

    return (
        <Box
            borderBottomRadius="12px"
            bg="surfacePrimary"
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
                borderColor="borderDefault"
            >
                <Text fontSize="lg" textTransform="uppercase" color={textColor}>
                    {deploymentName}
                    {workflowVersion !== null && (
                        <Box as="span" ml={2} color="iconAccent">
                            / {deploymentChangelog}
                        </Box>
                    )}
                </Text>
            </HStack>
            <Box p={5} bg="secondBackgroundDefault" flex="1" maxW="100%" overflowY="scroll" overflowX="hidden">
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
                    <Text fontSize="sm" color="textSubtle">
                        Aucun workflow associé à ce déploiement.
                    </Text>
                )}
            </Box>
        </Box>
    );
};
