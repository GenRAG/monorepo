import { Box, IconButton, Divider, Tooltip, Spinner } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { Plus, Minus, Expand, Save } from "lucide-react";

interface CustomControlsProps {
    onMenuToggle?: () => void;
    onSave?: () => void;
    isSaving?: boolean;
}

const CustomControls = ({ onMenuToggle, onSave, isSaving }: CustomControlsProps) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const toolButtons = [
        {
            label: "Ajouter un bloc",
            icon: <Plus size={18} />,
            action: () => onMenuToggle?.(),
            tool: null,
        },
    ];

    const zoomButtons = [
        { label: "Agrandir", icon: <Plus size={18} />, action: () => zoomIn() },
        {
            label: "Réduire",
            icon: <Minus size={18} />,
            action: () => zoomOut(),
        },
        {
            label: "Centrer la vue",
            icon: <Expand size={18} />,
            action: () => fitView({ duration: 500, minZoom: 1, maxZoom: 1 }),
        },
    ];

    const renderButton = (label: string, icon: React.ReactElement, action: () => void, isActive = false) => (
        <Tooltip bg="tooltipBg" key={label} label={label} placement="right" color="white" borderRadius="8px" hasArrow>
            <IconButton
                aria-label={label}
                icon={icon}
                onClick={action}
                size="sm"
                variant="ghost"
                borderRadius="8px"
                color="textPrimary"
                bg={isActive ? "bubbleAccentBg" : "transparent"}
                _hover={{ bg: "bubbleAccentBg" }}
                _active={{ bg: "bubbleAccentBg" }}
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
                bg="surfaceAction"
                borderRadius="12px"
                border="1px solid"
                borderColor="borderDivider"
                p="6px"
                gap="2px"
                zIndex={5}
                boxShadow="lg"
            >
                {toolButtons.map(({ label, icon, action, tool }) => renderButton(label, icon, action, tool !== null))}

                <Divider borderColor="borderDivider" width="20px" my="2px" />

                <Tooltip
                    bg="tooltipBg"
                    label="Enregistrer l'architecture"
                    placement="right"
                    color="white"
                    borderRadius="8px"
                    hasArrow
                >
                    <IconButton
                        aria-label="Enregistrer l'architecture"
                        icon={isSaving ? <Spinner size="xs" /> : <Save size={18} />}
                        onClick={onSave}
                        size="sm"
                        variant="ghost"
                        borderRadius="8px"
                        color="textPrimary"
                        bg="transparent"
                        _hover={{ bg: "bubbleAccentBg" }}
                        _active={{ bg: "bubbleAccentBg" }}
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
                bg="surfaceAction"
                borderRadius="8px"
                border="1px solid"
                borderColor="borderDivider"
                px="4px"
                py="4px"
                gap="2px"
                zIndex={5}
                boxShadow="lg"
            >
                {zoomButtons.map(({ label, icon, action }, i) => (
                    <>
                        {i > 0 && <Box key={`div-${i}`} w="0.5px" h="20px" bg="borderDivider" mx="2px" />}
                        <Tooltip
                            bg="tooltipBg"
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
                                color="textPrimary"
                                bg="transparent"
                                _hover={{ bg: "bubbleAccentBg" }}
                                _active={{ bg: "bubbleAccentBg" }}
                            />
                        </Tooltip>
                    </>
                ))}
            </Box>
        </>
    );
};

export default CustomControls;
