import {
    Box,
    useColorModeValue,
    useDisclosure,
    useColorMode,
    Stack,
    Divider,
} from "@chakra-ui/react";
import { workspaceMenu, workspaceFeaturesMenu, workspaceSettingsMenu } from "app/Navigation/sidebarConfig";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import { SidebarHeader } from "app/Navigation/SidebarHeader";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarSection } from "app/Navigation/SidebarSection";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

const SidebarWorkspace = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const bg = useColorModeValue(
        "white",
        "linear-gradient(135deg,rgba(44, 44, 44, 0.54) 0%,rgb(69, 69, 69) 100%)"
    );
    const border = useColorModeValue(
        "grey.100",
        currentDarkTheme.rgba.primary20
    );
    const color = useColorModeValue("grey.900", "white");
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

    const getActiveItemFromPath = (pathname: string) => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const section = pathSegments[pathSegments.length - 1];
        const allMenuItems = [...workspaceMenu, ...workspaceFeaturesMenu, ...workspaceSettingsMenu];
        const matchingItem = allMenuItems.find(item => item.id === section);
        return matchingItem ? matchingItem.id : null;
    };

    const [activeItem, setActiveItem] = useState<string>(() => getActiveItemFromPath(location.pathname) || "chat");
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    useEffect(() => {
        const newActiveItem = getActiveItemFromPath(location.pathname);
        if (newActiveItem) {
            setActiveItem(newActiveItem);
        }
    }, [location.pathname]);

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
            justifyContent={"space-between"}
            position="relative"
            overflow="hidden"
        >
            <Stack gap={8}>
                <SidebarHeader titleColor="green.500" iconColor="grey.900" title="Workspace" isOpen={isOpen} onToggle={onToggle} color={color} />

                <Stack gap={0}>
                    <SidebarSection title="Menu" isOpen={isOpen}>
                        {workspaceMenu.map(({ id, icon, label }) => (
                            <SidebarItem
                                key={id}
                                active={activeItem === id}
                                onClick={() => {
                                    if (workspaceId) {
                                        setActiveItem(id);
                                        navigate(`/workspace/${workspaceId}/${id}`);
                                    }
                                }}
                                icon={icon}
                                label={label}
                                open={isOpen}
                                expandedItem={expandedItem}
                                setExpandedItem={setExpandedItem}
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
                                active={activeItem === id}
                                onClick={() => {
                                    if (workspaceId) {
                                        setActiveItem(id);
                                        navigate(`/workspace/${workspaceId}/${id}`);
                                    }
                                }}
                                icon={icon}
                                label={label}
                                open={isOpen}
                                expandedItem={expandedItem}
                                setExpandedItem={setExpandedItem}
                                textColor="grey.900"
                                iconColor="grey.900"
                            />
                        ))}
                    </SidebarSection>
                </Stack>
            </Stack>
            <SidebarSection title="Settings" isOpen={isOpen}>
                {workspaceSettingsMenu.map(({ id, icon, label }) => (
                    <SidebarItem
                        key={id}
                        active={activeItem === id}
                        onClick={() => {
                            if (workspaceId) {
                                setActiveItem(id);
                                navigate(`/workspace/${workspaceId}/${id}`);
                            }
                        }}
                        icon={icon}
                        label={label}
                        open={isOpen}
                        expandedItem={expandedItem}
                        setExpandedItem={setExpandedItem}
                        textColor="grey.900"
                        iconColor="grey.900"
                    />
                ))}
            </SidebarSection>
        </Box>
    );
};

export default SidebarWorkspace;
