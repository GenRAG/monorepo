import {
    Box,
    IconButton,
    Divider,
    Tooltip,
    useColorModeValue,
    Spinner,
} from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import {
    Plus,
    Minus,
    Expand,
    MousePointer2,
    Hand,
    Frame,
    LayoutGrid,
    Image,
    MoreHorizontal,
    Save,
} from "lucide-react";
import { useState } from "react";

type Tool = "select" | "pan" | "frame" | null;

interface CustomControlsProps {
    onMenuToggle?: () => void;
    onSave?: () => void;
    isSaving?: boolean;
}

const CustomControls = ({ onMenuToggle, onSave, isSaving }: CustomControlsProps) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [activeTool, setActiveTool] = useState<Tool>("pan");

    const bgColor = useColorModeValue("white", "grey.800");
    const iconColor = useColorModeValue("grey.900", "grey.100");
    const hoverBg = useColorModeValue("green.100", "green.800");
    const activeBg = useColorModeValue("green.100", "green.800");
    const dividerColor = useColorModeValue("grey.200", "grey.700");

    const toolButtons = [
        {
            label: "Add node",
            icon: <Plus size={18} />,
            action: () => onMenuToggle?.(),
            tool: null,
        },
        {
            label: "Frame",
            icon: <Frame size={18} />,
            action: () => setActiveTool("frame"),
            tool: "frame" as Tool,
        },
        {
            label: "Select",
            icon: <MousePointer2 size={18} />,
            action: () => setActiveTool("select"),
            tool: "select" as Tool,
        },
        {
            label: "Pan",
            icon: <Hand size={18} />,
            action: () => setActiveTool("pan"),
            tool: "pan" as Tool,
        },
    ];

    const utilityButtons = [
        {
            label: "Add group",
            icon: <LayoutGrid size={18} />,
            action: () => {},
        },
        {
            label: "Insert image",
            icon: <Image size={18} />,
            action: () => {},
        },
    ];

    const zoomButtons = [
        { label: "Zoom in", icon: <Plus size={18} />, action: () => zoomIn() },
        {
            label: "Zoom out",
            icon: <Minus size={18} />,
            action: () => zoomOut(),
        },
        {
            label: "Fit view",
            icon: <Expand size={18} />,
            action: () => fitView({ duration: 500, minZoom: 1, maxZoom: 1 }),
        },
    ];

    const tooltipBg = useColorModeValue("grey.700", "green.600");

    const renderButton = (
        label: string,
        icon: React.ReactElement,
        action: () => void,
        isActive = false,
    ) => (
        <Tooltip
            bg={tooltipBg}
            key={label}
            label={label}
            placement="right"
            color="white"
            borderRadius="8px"
            hasArrow
        >
            <IconButton
                aria-label={label}
                icon={icon}
                onClick={action}
                size="sm"
                variant="ghost"
                borderRadius="8px"
                color={iconColor}
                bg={isActive ? activeBg : "transparent"}
                _hover={{ bg: isActive ? activeBg : hoverBg }}
                _active={{ bg: activeBg }}
            />
        </Tooltip>
    );

    return (
        <>
            <Box
                position="absolute"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                display="flex"
                flexDirection="column"
                alignItems="center"
                bg={bgColor}
                borderRadius="12px"
                border="1px solid"
                borderColor={dividerColor}
                p="6px"
                gap="2px"
                zIndex={5}
                boxShadow="lg"
            >
                {toolButtons.map(({ label, icon, action, tool }) =>
                    renderButton(
                        label,
                        icon,
                        action,
                        tool !== null && activeTool === tool,
                    ),
                )}

                <Divider borderColor={dividerColor} width="20px" my="2px" />

                {utilityButtons.map(({ label, icon, action }) =>
                    renderButton(label, icon, action),
                )}

                <Divider borderColor={dividerColor} width="20px" my="2px" />

                {renderButton(
                    "More options",
                    <MoreHorizontal size={18} />,
                    () => {},
                )}

                <Divider borderColor={dividerColor} width="20px" my="2px" />

                <Tooltip
                    bg={tooltipBg}
                    label="Save workflow"
                    placement="right"
                    color="white"
                    borderRadius="8px"
                    hasArrow
                >
                    <IconButton
                        aria-label="Save workflow"
                        icon={isSaving ? <Spinner size="xs" /> : <Save size={18} />}
                        onClick={onSave}
                        size="sm"
                        variant="ghost"
                        borderRadius="8px"
                        color="green.500"
                        bg="transparent"
                        _hover={{ bg: hoverBg }}
                        _active={{ bg: activeBg }}
                        isDisabled={isSaving}
                    />
                </Tooltip>
            </Box>

            <Box
                position="absolute"
                bottom="10px"
                right="50%"
                transform="translateX(50%)"
                display="flex"
                flexDirection="row"
                alignItems="center"
                bg={bgColor}
                borderRadius="8px"
                border="1px solid"
                borderColor={dividerColor}
                px="4px"
                py="4px"
                gap="2px"
                zIndex={5}
                boxShadow="lg"
            >
                {zoomButtons.map(({ label, icon, action }, i) => (
                    <>
                        {i > 0 && (
                            <Box
                                key={`div-${i}`}
                                w="0.5px"
                                h="20px"
                                bg={dividerColor}
                                mx="2px"
                            />
                        )}
                        <Tooltip
                            bg={tooltipBg}
                            key={label}
                            label={label}
                            placement="top"
                            color="white"
                            borderRadius="8px"
                            hasArrow
                        >
                            <IconButton
                                aria-label={label}
                                icon={icon}
                                onClick={action}
                                size="sm"
                                variant="ghost"
                                borderRadius="8px"
                                color={iconColor}
                                bg="transparent"
                                _hover={{ bg: hoverBg }}
                                _active={{ bg: activeBg }}
                            />
                        </Tooltip>
                    </>
                ))}
            </Box>
        </>
    );
};

export default CustomControls;
