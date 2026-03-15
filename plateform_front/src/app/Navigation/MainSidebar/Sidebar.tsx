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
import { Menu, NetworkIcon } from "lucide-react";
import WorkspaceDropdown from "app/Navigation/MainSidebar/WorkspaceDropdown";
import { mainMenu, supportMenu } from "app/Navigation/sidebarConfig";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import { SidebarHeader } from "app/Navigation/SidebarHeader";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarSection } from "app/Navigation/SidebarSection";
import { useUserInfo } from "hooks/useUserInfo";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";
import { WorkspacePreview } from "types/workspace";

const MOCK_WORKSPACES: WorkspacePreview[] = [
    {
        id: "mock-workspace-1",
        name: "Workspace Demo",
        documentsCount: 12,
        updatedAt: new Date().toISOString(),
    },
];

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { name, email } = useUserInfo();
    const { data: workspaces = [] } = useGetUserWorkspacesQuery();
    const isMobile = useAppResponsive({ base: true, lg: false });
    const defaultActivePath = useActiveSidebarItem([
        ...mainMenu.map((i) => i.id),
    ]);

    const displayedWorkspaces =
        workspaces.length > 0 ? workspaces : MOCK_WORKSPACES;
    const currentWorkspaceIdFromPath = useMemo(() => {
        const match = location.pathname.match(/^\/workspaces\/([^/]+)/);
        return match?.[1];
    }, [location.pathname]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
        currentWorkspaceIdFromPath ?? displayedWorkspaces[0]?.id ?? "",
    );

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

    const activePath = location.pathname.startsWith("/workspaces")
        ? "workspaces"
        : defaultActivePath;

    const { isOpen, onToggle, onClose } = useDisclosure({
        defaultIsOpen: false,
    });

    useEffect(() => {
        if (location.pathname.includes("/workspaces/")) {
            onClose();
        }
    }, [location.pathname, onClose]);

    useEffect(() => {
        if (currentWorkspaceIdFromPath) {
            setSelectedWorkspaceId(currentWorkspaceIdFromPath);
            return;
        }

        if (!selectedWorkspaceId && displayedWorkspaces.length > 0) {
            setSelectedWorkspaceId(displayedWorkspaces[0].id);
        }
    }, [currentWorkspaceIdFromPath, displayedWorkspaces, selectedWorkspaceId]);

    const handleItemClick = async (pathname: string) => {
        await navigate(pathname);
        if (isMobile) onToggle();
    };

    const handleWorkspaceChange = async (workspaceId: string) => {
        setSelectedWorkspaceId(workspaceId);
        await handleItemClick(`/workspaces/${workspaceId}/agents`);
    };

    const mockAgents = [
        { id: "1", name: "Agent 1" },
        { id: "2", name: "Agent 2" },
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
                {isOpen && displayedWorkspaces.length > 0 && (
                    <Stack spacing={1}>
                        <WorkspaceDropdown
                            workspaces={displayedWorkspaces}
                            selectedId={selectedWorkspaceId}
                            onSelect={handleWorkspaceChange}
                        />
                    </Stack>
                )}

                <SidebarSection title="Menu" isOpen={isOpen}>
                    {mainMenu.map(({ id, icon, label }) => (
                        <SidebarItem
                            key={id}
                            active={activePath === id}
                            onClick={async () => {
                                if (id === "workspaces") {
                                    await handleItemClick(
                                        `/workspaces/${selectedWorkspaceId}/agents`,
                                    );
                                    return;
                                }

                                await navigate(`/${id}`);
                            }}
                            icon={icon}
                            label={label}
                            open={isOpen}
                            {...(id === "workspaces" && {
                                badge: `${mockAgents.length}`,
                                childrenItems: mockAgents?.map((a) => ({
                                    icon: NetworkIcon,
                                    label: a.name,
                                    onClick: async () => {
                                        await handleItemClick(
                                            `/workspaces/${selectedWorkspaceId}/agents/${a.id}/playground`,
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
