import {
    VStack, Divider, Button, Icon, HStack, Avatar, Text, useColorModeValue,
} from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";

interface SidebarFooterProps {
    isOpen: boolean;
    colorMode: string;
    toggleColorMode: () => void;
    activeItem: string;
    setActiveItem: (id: string) => void;
    name: string;
    email: string;
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

    const color = useColorModeValue("black", "whites.offwhite");
    const dividerColor = useColorModeValue("grey.100", "grey.700");

    return (
        <VStack align="stretch" spacing={2}>
            <SidebarSection title="Support" isOpen={isOpen}>
                {supportMenu.map(({ id, icon, label }) => (
                    <SidebarItem
                        key={id}
                        active={activeItem === id}
                        onClick={() => setActiveItem(id)}
                        icon={icon}
                        label={label}
                        open={isOpen}
                        expandedItem={expandedItem}
                        setExpandedItem={setExpandedItem}
                    />
                ))}
            </SidebarSection>

            <Button
                mt={2}
                size="sm"
                w={isOpen ? "full" : "auto"}
                variant="ghost"
                onClick={toggleColorMode}
                leftIcon={<Icon as={colorMode === "light" ? Moon : Sun} />}
            >
                {isOpen && (colorMode === "light" ? "Dark mode" : "Light mode")}
            </Button>

            <Divider w="100%" borderColor={dividerColor} borderWidth="1px" />

            <HStack p={3} ml={0.5} spacing={3} justify={isOpen ? "flex-start" : ""}>
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
    );
}
