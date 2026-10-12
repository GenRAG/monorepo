import { Fragment } from "react";
import { Box, IconButton, Spinner, Tooltip, useColorMode, type PlacementWithLogical } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { Expand, Minus, Plus, Save } from "lucide-react";
import { getGlassInk } from "components/ui/GlassNav";
import { GlassSurface } from "components/ui/GlassNav/GlassSurface";
import { GLASS_BORDER, GLASS_FOCUS_RING } from "themeNew/foundations/glass";

interface CustomControlsProps {
    onMenuToggle?: () => void;
    onSave?: () => void;
    isSaving?: boolean;
}

interface ControlButton {
    label: string;
    icon: React.ReactElement;
    action?: () => void;
    isDisabled?: boolean;
}

/** Builder controls in the frosted glass of MultiOptionButtons: block / save on the left, zoom at the bottom. */
const CustomControls = ({ onMenuToggle, onSave, isSaving }: CustomControlsProps) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { colorMode } = useColorMode();
    const ink = getGlassInk(colorMode);

    const toolButtons: ControlButton[] = [
        { label: "Ajouter un bloc", icon: <Plus size={18} />, action: onMenuToggle },
        {
            label: "Enregistrer l'architecture",
            icon: isSaving ? <Spinner size="xs" /> : <Save size={18} />,
            action: onSave,
            isDisabled: isSaving,
        },
    ];

    const zoomButtons: ControlButton[] = [
        { label: "Agrandir", icon: <Plus size={18} />, action: () => void zoomIn() },
        { label: "Réduire", icon: <Minus size={18} />, action: () => void zoomOut() },
        {
            label: "Centrer la vue",
            icon: <Expand size={18} />,
            action: () => void fitView({ duration: 500, minZoom: 1, maxZoom: 1 }),
        },
    ];

    const separator = (vertical: boolean) => (
        <Box
            w={vertical ? "16px" : "1px"}
            h={vertical ? "1px" : "16px"}
            bg={GLASS_BORDER[colorMode]}
            my={vertical ? "2px" : 0}
            mx={vertical ? 0 : "2px"}
        />
    );

    const renderButtons = (buttons: ControlButton[], placement: PlacementWithLogical) =>
        buttons.map(({ label, icon, action, isDisabled }, i) => (
            <Fragment key={label}>
                {i > 0 && separator(placement === "right")}
                <Tooltip bg="tooltipBg" label={label} placement={placement} color="white" borderRadius="8px" hasArrow>
                    <IconButton
                        aria-label={label}
                        icon={icon}
                        onClick={action}
                        isDisabled={isDisabled}
                        size="sm"
                        variant="ghost"
                        borderRadius="full"
                        color={ink.muted}
                        bg="transparent"
                        transition="background 0.15s, color 0.15s"
                        _hover={{ bg: ink.pillBg, color: ink.text }}
                        _active={{ bg: ink.pillBg }}
                        _focusVisible={{ boxShadow: GLASS_FOCUS_RING }}
                    />
                </Tooltip>
            </Fragment>
        ));

    return (
        <>
            <GlassSurface
                variant={colorMode}
                blur={12}
                withBoxShadow={false}
                borderRadius="full"
                position="absolute"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={1}
                p={1}
                zIndex={5}
            >
                {renderButtons(toolButtons, "right")}
            </GlassSurface>

            <GlassSurface
                variant={colorMode}
                blur={12}
                withBoxShadow={false}
                borderRadius="full"
                position="absolute"
                bottom="10px"
                left="50%"
                transform="translateX(-50%)"
                display="flex"
                alignItems="center"
                gap={1}
                p={1}
                zIndex={5}
            >
                {renderButtons(zoomButtons, "top")}
            </GlassSurface>
        </>
    );
};

export default CustomControls;
