import { ReactNode } from "react";
import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import useFixNodePosition from "hooks/workflow/useFixNodePosition";
import { useAppResponsive } from "hooks/useAppResponsive";

interface NodeCardProps {
    nodeId: string;
    header: ReactNode;
    body?: ReactNode;
    isSelected: boolean;
    onNodeClick?: (nodeId: string) => void;
}

const NodeCard = ({
    nodeId,
    header,
    body,
    isSelected,
    onNodeClick,
}: NodeCardProps) => {
    const fixPosition = useFixNodePosition(nodeId);
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });

    const handleClick = () => {
        onNodeClick?.(nodeId);
        setTimeout(async () => {
            await fixPosition();
        }, 500);
    };

    const headerBg = useColorModeValue("green.50", "grey.900");
    const bodyBg = useColorModeValue("white", "grey.800");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const borderActive = useColorModeValue("green.400", "green.500");
    const dividerColor = useColorModeValue("green.100", "grey.700");

    const shadowBase = "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)";
    const shadowSelected = useColorModeValue(
        "0 0 0 2px var(--chakra-colors-green-400), 0 4px 20px rgba(52,211,169,0.18)",
        "0 0 0 2px var(--chakra-colors-green-500), 0 4px 20px rgba(52,211,169,0.12)",
    );
    const shadowHover = useColorModeValue(
        "0 0 0 1.5px var(--chakra-colors-green-300), 0 6px 24px rgba(52,211,169,0.12)",
        "0 0 0 1.5px var(--chakra-colors-green-600), 0 6px 24px rgba(52,211,169,0.08)",
    );

    return (
        <Box
            onClick={handleClick}
            cursor="pointer"
            w={isMobile ? "140px" : "220px"}
            border="1px solid"
            borderColor={isSelected ? borderActive : borderColor}
            borderRadius="12px"
            boxShadow={isSelected ? shadowSelected : shadowBase}
            overflow="hidden"
            transition="all 0.18s ease"
            _hover={{
                boxShadow: isSelected ? shadowSelected : shadowHover,
                borderColor: isSelected
                    ? borderActive
                    : colorMode === "dark"
                      ? "green.300"
                      : "green.600",
                transform: "translateY(-1px)",
            }}
            _active={{ transform: "translateY(0px)" }}
        >
            <Box
                bg={headerBg}
                px={isMobile ? 2 : 3}
                py={isMobile ? 1.5 : 2}
                borderBottom="1px solid"
                borderColor={dividerColor}
            >
                {header}
            </Box>

            {body && (
                <Box bg={bodyBg} position="relative">
                    {body}
                </Box>
            )}
        </Box>
    );
};

export default NodeCard;
