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
} from "@chakra-ui/react";
import { Menu } from "lucide-react";
import {
    workspaceMenu,
    workspaceFeaturesMenu,
    workspaceSettingsMenu,
} from "app/Navigation/sidebarConfig";
import { SidebarHeader } from "app/Navigation/SidebarHeader";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarSection } from "app/Navigation/SidebarSection";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useNavigate, useParams } from "react-router-dom";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";

const SidebarWorkspace = () => {
    const navigate = useNavigate();
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const isMobile = useAppResponsive({ base: true, lg: false });
    const activePath = useActiveSidebarItem([
        ...workspaceMenu.map((i) => i.id),
        ...workspaceFeaturesMenu.map((i) => i.id),
        ...workspaceSettingsMenu.map((i) => i.id),
    ]);

    const bg = useColorModeValue(
        "white",
        "linear-gradient(135deg,rgba(44, 44, 44, 0.54) 0%,rgb(69, 69, 69) 100%)",
    );
    const bgMobile = useColorModeValue(
        "white",
        "linear-gradient(135deg,rgb(44, 44, 44) 0%,rgb(69, 69, 69) 100%)",
    );
    const border = useColorModeValue(
        "grey.100",
        currentDarkTheme.rgba.primary20,
    );
    const color = useColorModeValue("grey.900", "white");

    const { isOpen, onToggle } = useDisclosure({
        defaultIsOpen: !isMobile,
    });

    const handleItemClick = async (id: string) => {
        if (workspaceId) {
            await navigate(`/workspaces/${workspaceId}/${id}`);
            if (isMobile) onToggle();
        }
    };

    const sidebarContent = (
        <Stack gap={8} flex={1} overflow="hidden">
            <SidebarHeader
                titleColor="green.500"
                iconColor="grey.900"
                title="Workspace"
                isOpen={isOpen}
                onToggle={onToggle}
                color={color}
                onMobileClose={isMobile ? onToggle : undefined}
            />

            <Stack gap={0} flex={1}>
                <SidebarSection title="Menu" isOpen={isOpen}>
                    {workspaceMenu.map(({ id, icon, label }) => (
                        <SidebarItem
                            key={id}
                            active={activePath === id}
                            onClick={() => handleItemClick(id)}
                            icon={icon}
                            label={label}
                            open={isOpen}
                            //expandedItem={expandedItem}
                            //setExpandedItem={setExpandedItem}
                            textColor="grey.900"
                            iconColor="grey.900"
                        />
                    ))}
                </SidebarSection>
                <Divider w="100%" borderColor={border} borderWidth="1px" />

                <SidebarSection title="Features" isOpen={isOpen}>
                    {workspaceFeaturesMenu.map(({ id, icon, label }) => (
                        <SidebarItem
                            key={id}
                            active={activePath === id}
                            onClick={() => handleItemClick(id)}
                            icon={icon}
                            label={label}
                            open={isOpen}
                            //expandedItem={expandedItem}
                            //setExpandedItem={setExpandedItem}
                            textColor="grey.900"
                            iconColor="grey.900"
                        />
                    ))}
                </SidebarSection>
            </Stack>

            <SidebarSection title="Settings" isOpen={isOpen}>
                {workspaceSettingsMenu.map(({ id, icon, label }) => (
                    <SidebarItem
                        key={id}
                        active={activePath === id}
                        onClick={() => handleItemClick(id)}
                        icon={icon}
                        label={label}
                        open={isOpen}
                        textColor="grey.900"
                        iconColor="grey.900"
                    />
                ))}
            </SidebarSection>
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
                        aria-label="Ouvrir le menu workspace"
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
            w={isOpen ? "200px" : "60px"}
            bg={bg}
            borderRadius="0"
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

export default SidebarWorkspace;
