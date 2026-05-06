import {
    VStack,
    Divider,
    HStack,
    Avatar,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useNavigate, useParams } from "react-router-dom";

interface SidebarFooterProps {
    isOpen: boolean;
    colorMode: string;
    toggleColorMode: () => void;
    activeItem: string;
    name?: string;
    email?: string;
    supportMenu: { id: string; icon: any; label: string }[];
}

export const SidebarFooter = ({
    isOpen,
    colorMode,
    toggleColorMode,
    activeItem,
    name,
    email,
    supportMenu,
}: SidebarFooterProps) => {
    const navigate = useNavigate();
    const { workspaceId, agentId } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();
    const color = useColorModeValue("grey.900", "white");
    const dividerColor = useColorModeValue(
        "grey.100",
        currentDarkTheme.rgba.primary20,
    );
    const handleFooterItemClick = (id: string) => {
        if (id === "settings" && workspaceId && agentId) {
            void navigate(
                `/workspaces/${workspaceId}/agents/${agentId}/settings`,
            );
        } else if (id === "help") {
            void navigate("/help");
        } else if (id === "notifications") {
            void navigate("/docs");
        }
    };

    return (
        <VStack align="stretch" gap={0}>
            <SidebarSection title="Assistance" isOpen={isOpen}>
                {supportMenu.map(({ id, icon, label }) => (
                    <SidebarItem
                        key={id}
                        active={activeItem === id}
                        onClick={() => handleFooterItemClick(id)}
                        icon={icon}
                        label={label}
                        open={isOpen}
                    />
                ))}
                <SidebarItem
                    icon={colorMode === "light" ? Moon : Sun}
                    label={colorMode === "light" ? "Mode sombre" : "Mode clair"}
                    open={isOpen}
                    onClick={toggleColorMode}
                />
            </SidebarSection>
            {(name || email) && (
                <VStack align="stretch" gap={0}>
                    <Divider
                        w="100%"
                        borderColor={dividerColor}
                        borderWidth="1px"
                    />
                    <HStack
                        mt={2}
                        p={3}
                        ml={0.5}
                        spacing={3}
                        justify={isOpen ? "flex-start" : ""}
                    >
                        <Avatar size="sm" name={name} />
                        {isOpen && (
                            <Text fontSize="sm" color={color}>
                                {((name || email) ?? "").length > 15
                                    ? ((name || email) ?? "").slice(0, 15) +
                                      "..."
                                    : ((name || email) ?? "")}
                            </Text>
                        )}
                    </HStack>
                </VStack>
            )}
        </VStack>
    );
};
