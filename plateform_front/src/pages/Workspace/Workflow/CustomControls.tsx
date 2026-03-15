import { Button, HStack, useColorModeValue } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { Expand, Minus, Plus } from "lucide-react";

const CustomControls = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const bgColor = useColorModeValue("white", "grey.800");
    const hoverBg = useColorModeValue("grey.100", "grey.700");
    const iconColor = useColorModeValue("black", "white");

    return (
        <HStack
            position="absolute"
            bottom="10px"
            right="50%"
            transform="translateX(50%)"
            boxShadow="lg"
            spacing="0"
            zIndex={5}
            bg={bgColor}
            borderRadius="50px"
            border="1px solid"
            borderColor={useColorModeValue("grey.200", "green.600")}
            overflow="hidden"
        >
            {[
                {
                    label: "Zoom in",
                    icon: <Plus size={20} />,
                    action: () => zoomIn(),
                },
                {
                    label: "Zoom out",
                    icon: <Minus size={20} />,
                    action: () => zoomOut(),
                },
                {
                    label: "Fit view",
                    icon: <Expand size={20} />,
                    action: () =>
                        fitView({ duration: 500, minZoom: 1, maxZoom: 1 }),
                },
            ].map(({ label, icon, action }) => (
                <Button
                    key={label}
                    aria-label={label}
                    onClick={action}
                    borderRadius="0"
                    borderRight="1px solid"
                    borderColor="transparent"
                    bg="transparent"
                    color={iconColor}
                    _hover={{ bg: hoverBg }}
                    _active={{ bg: hoverBg }}
                    _focus={{ bg: hoverBg }}
                >
                    {icon}
                </Button>
            ))}
        </HStack>
    );
};

export default CustomControls;
