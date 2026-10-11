import { Handle, Position } from "@xyflow/react";
import { Box, Flex, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { AlertTriangle, ChevronRight, Library } from "lucide-react";
import type { AppNodeData, WorkflowNodeProps } from "../../../types/app-node";
import { DATASET_ID_INPUT } from "../../../graph/create-flow-node";
import BoxIcon from "../../BoxIcon";
import { useDatasetCatalog } from "./DatasetCatalog";

const pluralize = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

export const DatasetNode = ({ id, data, selected, onNodeClick, readonly }: WorkflowNodeProps) => {
    const nodeData = data as AppNodeData;
    const catalog = useDatasetCatalog();
    const datasetId = nodeData.inputs?.[DATASET_ID_INPUT];
    const entry = datasetId ? catalog?.[datasetId] : undefined;
    const isMissing = catalog !== null && !entry;

    const bg = useColorModeValue("white", "grey.800");
    const bgHover = useColorModeValue("green.50", "grey.700");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const borderActive = useColorModeValue("green.400", "green.500");
    const accentBg = useColorModeValue("green.50", "green.900");
    const accentColor = useColorModeValue("green.500", "green.300");
    const errorColor = useColorModeValue("red.500", "red.300");
    const errorBg = useColorModeValue("red.50", "red.900");
    const labelColor = useColorModeValue("grey.800", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");

    const title = isMissing ? "Base introuvable" : (entry?.name ?? "Base de connaissances");
    const subtitle = isMissing
        ? "Supprimée ou retirée : ignorée"
        : entry
          ? pluralize(entry.documentsCount, "document")
          : undefined;

    return (
        <Box className="drag-handle" cursor="grab" position="relative">
            <Handle
                id="setting-target"
                type="target"
                position={Position.Left}
                style={{ backgroundColor: "#8b5cf6", border: "2px solid #E7E7E7", width: "8px", height: "8px" }}
            />
            <Box
                onClick={(e) => {
                    e.stopPropagation();
                    onNodeClick?.(id);
                }}
                cursor={readonly ? "default" : "pointer"}
                bg={bg}
                borderWidth="1px"
                borderStyle="solid"
                borderColor={isMissing ? errorColor : selected ? borderActive : borderColor}
                borderRadius="12px"
                minW="160px"
                maxW="220px"
                overflow="hidden"
                transition="all 0.15s"
                boxShadow={selected ? "0 0 0 2px #34D3A9" : "0 2px 8px rgba(0,0,0,0.06)"}
                _hover={{ bg: bgHover, borderColor: isMissing ? errorColor : borderActive }}
            >
                <Box h="3px" style={{ background: "linear-gradient(to right, #34D3A9, #07966F)" }} />
                <Flex align="center" gap={3} px={3} py={3}>
                    <BoxIcon
                        icon={isMissing ? AlertTriangle : Library}
                        color={isMissing ? errorColor : accentColor}
                        bg={isMissing ? errorBg : accentBg}
                        size="sm"
                    />
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                        <Text
                            fontSize="9px"
                            fontWeight={700}
                            letterSpacing="0.07em"
                            textTransform="uppercase"
                            color={isMissing ? errorColor : accentColor}
                            lineHeight={1}
                            mb="2px"
                        >
                            Base de connaissances
                        </Text>
                        <Text fontSize="sm" fontWeight={600} color={labelColor} noOfLines={1}>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text fontSize="10px" color={isMissing ? errorColor : subColor} noOfLines={1}>
                                {subtitle}
                            </Text>
                        )}
                    </VStack>
                    {!readonly && <Icon as={ChevronRight} boxSize={4} color={subColor} flexShrink={0} />}
                </Flex>
            </Box>
        </Box>
    );
};

export default DatasetNode;
