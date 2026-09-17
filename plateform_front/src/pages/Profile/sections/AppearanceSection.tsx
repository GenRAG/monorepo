import { Box, Button, ButtonGroup, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { LayoutGrid, PanelBottom, PanelLeft, type LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "store";
import { setSidebarLayoutMode, SidebarLayoutMode } from "store/navigationSlice";

const OPTIONS: { id: SidebarLayoutMode; label: string; description: string; icon: LucideIcon }[] = [
    { id: "auto", label: "Auto", description: "Sidebar sur desktop, bottom bar sur mobile", icon: LayoutGrid },
    { id: "sidebar", label: "Sidebar", description: "Toujours en barre latérale", icon: PanelLeft },
    { id: "bottombar", label: "Bottom bar", description: "Toujours en barre du bas", icon: PanelBottom },
];

const AppearanceSection = () => {
    const dispatch = useAppDispatch();
    const layoutMode = useAppSelector((state) => state.navigation.sidebarLayoutMode);

    return (
        <VStack align="stretch" spacing={6} p={6}>
            <Box>
                <Text fontSize="md" fontWeight="600" color="textPrimary">
                    Apparence
                </Text>
                <Text fontSize="sm" color="textLabel" mt={0.5}>
                    Choisissez comment la navigation principale s&apos;affiche.
                </Text>
            </Box>

            <VStack
                align="stretch"
                spacing={3}
                p={4}
                bg="surfaceSubtle"
                borderRadius="10px"
                border="1px solid"
                borderColor="borderDefault"
            >
                <Text fontSize="xs" color="textLabel" fontWeight="500">
                    Navigation
                </Text>
                <ButtonGroup size="sm" isAttached variant="outline" flexWrap="wrap">
                    {OPTIONS.map((option) => (
                        <Button
                            key={option.id}
                            variant={layoutMode === option.id ? "superPrimary" : "outline"}
                            leftIcon={<Icon as={option.icon} boxSize={3.5} />}
                            onClick={() => dispatch(setSidebarLayoutMode(option.id))}
                        >
                            {option.label}
                        </Button>
                    ))}
                </ButtonGroup>
                <HStack spacing={1.5}>
                    {OPTIONS.filter((o) => o.id === layoutMode).map((option) => (
                        <Text key={option.id} fontSize="xs" color="textFaint">
                            {option.description}
                        </Text>
                    ))}
                </HStack>
            </VStack>
        </VStack>
    );
};

export default AppearanceSection;
