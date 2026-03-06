import {
    Box,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerOverlay,
    IconButton,
    useColorModeValue,
    useDisclosure,
    useColorMode,
    Stack,
} from "@chakra-ui/react";
import { Menu } from "lucide-react";
import { mainMenu, supportMenu } from "app/Navigation/sidebarConfig";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import { SidebarHeader } from "app/Navigation/SidebarHeader";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarSection } from "app/Navigation/SidebarSection";
import { useUserInfo } from "hooks/useUserInfo";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { name, email } = useUserInfo();
    const isMobile = useAppResponsive({ base: true, lg: false });
    const activePath = useActiveSidebarItem([
        "dashboard",
        "assistants",
        "workspaces",
        "billing",
    ]);

    const { colorMode, toggleColorMode } = useColorMode();
    const color = useColorModeValue("grey.300", "white");
    const bg = useColorModeValue(
        "black",
        "linear-gradient(135deg, #0505058a 0%, #363636ff 100%)",
    );
    const border = useColorModeValue(
        "green.100",
        currentDarkTheme.rgba.primary20,
    );
    const bgMobile = useColorModeValue(
        "black",
        "linear-gradient(135deg,rgb(5, 5, 5) 0%, #363636ff 100%)",
    );

    const { isOpen, onToggle, onClose } = useDisclosure({
        defaultIsOpen: false,
    });

    useEffect(() => {
        if (location.pathname.includes("/workspaces/")) {
            onClose();
        }
    }, [location.pathname, onClose]);

    const handleItemClick = async (pathname: string) => {
        await navigate(pathname);
        if (isMobile) onToggle();
    };

    const mockWorkspaces = [
        {
            id: "1",
            name: "Workspace 1",
        },
        {
            id: "2",
            name: "Workspace 2",
        },
    ];

    const mockAssistants = [
        {
            id: "1",
            name: "Assistant 1",
        },
        {
            id: "2",
            name: "Assistant 2",
        },
    ];

    const sidebarContent = (
        <Stack gap={8} h="100vh" flex={1} overflow="hidden">
            <SidebarHeader
                title="GenRAG"
                isOpen={isOpen}
                onToggle={onToggle}
                color={color}
                onMobileClose={isMobile ? onToggle : undefined}
            />

            <Stack gap={0} flex={1} overflowY="auto">
                <SidebarSection title="Menu" isOpen={isOpen}>
                    {mainMenu.map(({ id, icon, label }) => (
                        <SidebarItem
                            key={id}
                            active={activePath === id}
                            onClick={async () => {
                                await navigate(`/${id}`);
                            }}
                            icon={icon}
                            label={label}
                            open={isOpen}
                            {...(id === "workspaces" && {
                                badge: `${mockWorkspaces.length}`,
                                childrenItems: mockWorkspaces?.map((w) => ({
                                    label: w.name,
                                    onClick: async () => {
                                        await handleItemClick(
                                            `/workspaces/${w.id}/chat`,
                                        );
                                    },
                                })),
                            })}
                            {...(id === "assistants" && {
                                badge: `${mockAssistants.length}`,
                                childrenItems: mockAssistants.map((a) => ({
                                    label: a.name,
                                    onClick: async () => {
                                        await handleItemClick(
                                            `/assistants/${a.id}`,
                                        );
                                    },
                                })),
                            })}
                        />
                    ))}
                </SidebarSection>
            </Stack>

            <SidebarFooter
                isOpen={isOpen}
                colorMode={colorMode}
                toggleColorMode={toggleColorMode}
                activeItem={activePath ?? "dashboard"}
                name={name}
                email={email}
                supportMenu={supportMenu}
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
                    justifyContent="center"
                    pt={4}
                    flexShrink={0}
                >
                    <IconButton
                        aria-label="Ouvrir le menu"
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
                    <DrawerContent bg={bgMobile} maxW="280px">
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
            w={isOpen ? "220px" : "60px"}
            bg={bg}
            borderRight="1px solid"
            borderColor={border}
            transition="width 0.3s ease"
            zIndex={10}
            position="relative"
            overflow="hidden"
            flexShrink={0}
        >
            {sidebarContent}
        </Box>
    );
};

export default Sidebar;
