import {
    Box,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerOverlay,
    IconButton,
    useColorModeValue,
    useDisclosure,
    Stack,
    Divider,
    useColorMode,
} from "@chakra-ui/react";
import { LayoutDashboard, Menu } from "lucide-react";
import {
    agentMenu,
    agentFeaturesMenu,
    agentSettingsMenu,
} from "app/Navigation/sidebarConfig";
import { SidebarHeader } from "app/Navigation/SidebarHeader";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarSection } from "app/Navigation/SidebarSection";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useNavigate, useParams } from "react-router-dom";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";
import { SidebarFooter } from "app/Navigation/SidebarFooter";

const AgentSidebar = () => {
    const navigate = useNavigate();

    const { workspaceId, agentId } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const isMobile = useAppResponsive({ base: true, lg: false });

    const activePath = useActiveSidebarItem([
        ...agentMenu.map((i) => i.id),
        ...agentFeaturesMenu.map((i) => i.id),
        ...agentSettingsMenu.map((i) => i.id),
    ]);

    const { colorMode, toggleColorMode } = useColorMode();

    const bg = useColorModeValue(
        "white",
        "linear-gradient(135deg,rgba(44, 44, 44, 0.54) 0%,rgb(69, 69, 69) 100%)",
    );
    const bgMobile = useColorModeValue(
        "white",
        "linear-gradient(135deg,rgb(44, 44, 44) 0%,rgb(69, 69, 69) 100%)",
    );
    const border = useColorModeValue("grey.100", "grey.800");
    const color = useColorModeValue("grey.900", "white");

    const { isOpen, onToggle } = useDisclosure({
        defaultIsOpen: !isMobile,
    });

    const handleItemClick = async (id: string) => {
        if (workspaceId && agentId) {
            await navigate(
                `/workspaces/${workspaceId}/agents/${agentId}/${id}`,
            );
            if (isMobile) onToggle();
        }
    };

    const handleDashboardClick = async () => {
        await navigate(`/workspaces/${workspaceId}/dashboard`);
        if (isMobile) onToggle();
    };

    const sidebarContent = (
        <Stack gap={8} flex={1} overflow="hidden">
            <SidebarHeader
                titleColor="green.500"
                iconColor="grey.900"
                title="Agent"
                isOpen={isOpen}
                onToggle={onToggle}
                color={color}
                onMobileClose={isMobile ? onToggle : undefined}
            />

            <Stack gap={0} flex={1}>
                <SidebarSection title="Accès rapide" isOpen={isOpen}>
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Tableau de bord"
                        active={false}
                        onClick={handleDashboardClick}
                        open={isOpen}
                    />
                </SidebarSection>
                <Divider w="100%" borderColor={border} borderWidth="1px" />

                <SidebarSection title="Menu" isOpen={isOpen}>
                    {agentMenu.map(({ id, icon, label }) => (
                        <SidebarItem
                            key={id}
                            active={activePath === id}
                            onClick={() => handleItemClick(id)}
                            icon={icon}
                            label={label}
                            open={isOpen}
                        />
                    ))}
                </SidebarSection>
                <Divider w="100%" borderColor={border} borderWidth="1px" />

                <SidebarSection title="Fonctionnalités" isOpen={isOpen}>
                    {agentFeaturesMenu.map(({ id, icon, label }) => (
                        <SidebarItem
                            key={id}
                            active={activePath === id}
                            onClick={() => handleItemClick(id)}
                            icon={icon}
                            label={label}
                            open={isOpen}
                        />
                    ))}
                </SidebarSection>
            </Stack>
            <SidebarFooter
                isOpen={isOpen}
                colorMode={colorMode}
                toggleColorMode={toggleColorMode}
                activeItem={activePath ?? "dashboard"}
                supportMenu={agentSettingsMenu}
            />
        </Stack>
    );

    if (isMobile) {
        return (
            <>
                <Box
                    w="48px"
                    minW="48px"
                    h="100vh"
                    bg={bgMobile}
                    borderRight="1px solid"
                    borderColor={border}
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="center"
                    pt={4}
                    flexShrink={0}
                >
                    <IconButton
                        aria-label="Ouvrir le menu agent"
                        icon={<Menu size={20} />}
                        variant="ghost"
                        color={color}
                        onClick={onToggle}
                    />
                </Box>
                <Drawer
                    isOpen={isOpen}
                    placement="left"
                    onClose={onToggle}
                    size="xs"
                >
                    <DrawerOverlay />
                    <DrawerContent bg={bgMobile} maxW="280px" borderRadius={0}>
                        <DrawerBody p={0} display="flex" flexDirection="column">
                            {sidebarContent}
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        );
    }

    return (
        <Box
            h="100vh"
            w={isOpen ? "200px" : "60px"}
            bg={bg}
            borderRight="1px solid"
            borderColor={border}
            display="flex"
            flexDirection="column"
            transition="width 0.3s ease"
            zIndex={10}
            justifyContent="space-between"
            position="relative"
            overflow="hidden"
            flexShrink={0}
        >
            {sidebarContent}
        </Box>
    );
};

export default AgentSidebar;
