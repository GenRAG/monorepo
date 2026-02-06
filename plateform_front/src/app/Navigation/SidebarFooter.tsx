import {
    VStack, Divider, Button, Icon, HStack, Avatar, Text, useColorModeValue,
} from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useNavigate } from "react-router-dom";

interface SidebarFooterProps {
    isOpen: boolean;
    colorMode: string;
    toggleColorMode: () => void;
    activeItem: string;
    setActiveItem: (id: string) => void;
    name?: string;
    email?: string;
    supportMenu: { id: string; icon: any; label: string }[];
    expandedItem: string | null;
    setExpandedItem: React.Dispatch<React.SetStateAction<string | null>>;
}

export const SidebarFooter = ({
    isOpen,
    colorMode,
    toggleColorMode,
    activeItem,
    setActiveItem,
    name,
    email,
    supportMenu,
    expandedItem,
    setExpandedItem,
}: SidebarFooterProps) => {

    const navigate = useNavigate();
    const color = useColorModeValue("grey.900", "white");
    const dividerColor = useColorModeValue(
        "grey.100",
        currentDarkTheme.rgba.primary20
    );
    const buttonHoverBg = useColorModeValue(
        currentDarkTheme.rgba.primary20,
        currentDarkTheme.rgba.primary20
    );

    const workspaceId = 12342;

    return (
        <VStack align="stretch" gap={0}>
            <SidebarSection title="Support" isOpen={isOpen}>
                {supportMenu.map(({ id, icon, label }) => (
                    <SidebarItem
                        key={id}
                        active={activeItem === id}
                        onClick={() => {
                            setActiveItem(id);
                            console.log(`${workspaceId}/support/${id}`);
                            navigate(`/${workspaceId}/${id}`);
                        }}
                        icon={icon}
                        label={label}
                        open={isOpen}
                        expandedItem={expandedItem}
                        setExpandedItem={setExpandedItem}
                    />
                ))}
            </SidebarSection>
            {name || email && (
                <VStack align="stretch" gap={0}>
                    <SidebarItem
                        icon={colorMode === "light" ? Moon : Sun}
                        label={colorMode === "light" ? "Dark mode" : "Light mode"}
                        open={isOpen}
                        onClick={toggleColorMode}
                        expandedItem={expandedItem}
                        setExpandedItem={setExpandedItem}
                    />
                    <Divider w="100%" borderColor={dividerColor} borderWidth="1px" />
                    <HStack mt={2} p={3} ml={0.5} spacing={3} justify={isOpen ? "flex-start" : ""}>
                        <Avatar size="sm" name={name} />
                        {isOpen && (
                            <Text fontSize="sm" color={color}>
                                {(name || email).length > 15
                                    ? (name || email).slice(0, 15) + "..."
                                    : name || email}
                            </Text>
                        )}
                    </HStack>
                </VStack>
            )}
        </VStack>
    );
}
