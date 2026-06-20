import { HStack, Text, Icon, useColorModeValue, IconButton } from "@chakra-ui/react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface SidebarHeaderProps {
    isOpen: boolean;
    onToggle: () => void;
    color: string;
    title: string;
    titleColor?: string;
    iconColor?: string;
    onMobileClose?: () => void;
}

export const SidebarHeader = ({
    isOpen,
    onToggle,
    title,
    titleColor = "grey.700",
    iconColor = "grey.600",
    onMobileClose,
}: SidebarHeaderProps) => {
    const iconColorValue = useColorModeValue(iconColor, "green.500");
    const titleColorValue = useColorModeValue(titleColor, "white");
    const hoverBg = useColorModeValue(currentDarkTheme.rgba.primary20, currentDarkTheme.rgba.primary20);

    return (
        <HStack justify="space-between" align="center" p={3}>
            {isOpen && (
                <Text fontWeight="bold" fontSize="xl" color={titleColorValue}>
                    {title}
                </Text>
            )}
            <IconButton
                size="sm"
                variant="ghost"
                onClick={onMobileClose ?? onToggle}
                aria-label="Toggle Sidebar"
                color={iconColorValue}
                _hover={{
                    bg: hoverBg,
                }}
                icon={<Icon boxSize={5} as={isOpen ? PanelRightOpen : PanelRightClose} />}
            />
        </HStack>
    );
};
