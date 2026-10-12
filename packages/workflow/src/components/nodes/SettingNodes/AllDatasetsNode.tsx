import { Handle, Position } from "@xyflow/react";
import { Box, Flex, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { AlertTriangle, ChevronRight, Library } from "lucide-react";
import type { AppNodeData, WorkflowNodeProps } from "../../../types/app-node";
import { HandleId } from "../../../types/edge";
import BoxIcon from "../../BoxIcon";
import { useDatasetCatalog } from "./DatasetCatalog";

const pluralize = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

/** Stands for a RETRIEVER without DATASET node: it searches every base of the agent. Clicking opens the retriever. */
export const AllDatasetsNode = ({ data, onNodeClick, readonly }: WorkflowNodeProps) => {
    const { parentNodeId } = data as AppNodeData;
    const catalog = useDatasetCatalog();
    const entries = catalog ? Object.values(catalog) : null;
    const isEmpty = entries?.length === 0;

    const bg = useColorModeValue("whiteAlpha.700", "blackAlpha.300");
    const bgHover = useColorModeValue("green.50", "grey.800");
    const borderColor = useColorModeValue("green.300", "grey.600");
    const accentBg = useColorModeValue("green.50", "green.900");
    const accentColor = useColorModeValue("green.500", "green.300");
    const warnColor = useColorModeValue("orange.500", "orange.300");
    const warnBg = useColorModeValue("orange.50", "orange.900");
    const labelColor = useColorModeValue("grey.800", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");

    const title = isEmpty ? "Aucune base" : "Toutes les bases";
    const subtitle = !entries
        ? "Toutes les bases de l'agent"
        : isEmpty
          ? "L'agent ne trouvera rien"
          : `${pluralize(entries.length, "base")} · ${pluralize(
                entries.reduce((sum, e) => sum + e.documentsCount, 0),
                "document",
            )}`;
    const color = isEmpty ? warnColor : accentColor;
    const isClickable = !readonly && !!onNodeClick && !!parentNodeId;

    return (
        <Box className="drag-handle" cursor="grab" position="relative">
            <Handle
                id={HandleId.SettingTarget}
                type="target"
                position={Position.Left}
                isConnectable={false}
                style={{ backgroundColor: "#8b5cf6", border: "2px solid #E7E7E7", width: "8px", height: "8px" }}
            />
            <Flex
                onClick={(e) => {
                    e.stopPropagation();
                    if (isClickable) onNodeClick(parentNodeId);
                }}
                align="center"
                gap={3}
                px={3}
                py={3}
                minW="160px"
                maxW="220px"
                cursor={isClickable ? "pointer" : "default"}
                bg={bg}
                borderWidth="1.5px"
                borderStyle="dashed"
                borderColor={isEmpty ? warnColor : borderColor}
                borderRadius="12px"
                transition="all 0.15s"
                _hover={isClickable ? { bg: bgHover, borderColor: color } : undefined}
            >
                <BoxIcon icon={isEmpty ? AlertTriangle : Library} color={color} bg={isEmpty ? warnBg : accentBg} size="sm" />
                <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text
                        fontSize="9px"
                        fontWeight={700}
                        letterSpacing="0.07em"
                        textTransform="uppercase"
                        color={color}
                        lineHeight={1}
                        mb="2px"
                    >
                        Base de connaissances
                    </Text>
                    <Text fontSize="sm" fontWeight={600} color={labelColor} noOfLines={1}>
                        {title}
                    </Text>
                    <Text fontSize="10px" color={isEmpty ? warnColor : subColor} noOfLines={1}>
                        {subtitle}
                    </Text>
                </VStack>
                {isClickable && <Icon as={ChevronRight} boxSize={4} color={subColor} flexShrink={0} />}
            </Flex>
        </Box>
    );
};

export default AllDatasetsNode;
