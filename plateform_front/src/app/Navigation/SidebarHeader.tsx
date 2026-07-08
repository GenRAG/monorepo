import { HStack, Icon, Image, useColorModeValue, IconButton } from "@chakra-ui/react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import logoGreen from "assets/logo/logoGreen.png";

interface SidebarHeaderProps {
    isOpen: boolean;
    onToggle: () => void;
    color: string;
    title: string;
    iconColor?: string;
    onMobileClose?: () => void;
}

export const SidebarHeader = ({
    isOpen,
    onToggle,
    title,
    iconColor = "grey.600",
    onMobileClose,
}: SidebarHeaderProps) => {
    const iconColorValue = useColorModeValue(iconColor, "green.500");
    const hoverBg = useColorModeValue(currentDarkTheme.rgba.primary20, currentDarkTheme.rgba.primary20);

    return (
        <HStack justify="space-between" align="center" p={3}>
            {isOpen && <Image src={logoGreen} alt={title} h="28px" w="28px" />}
            <IconButton
                size="sm"
                variant="ghost"
                onClick={onMobileClose ?? onToggle}
                aria-label="Toggle Sidebar"
                color={iconColorValue}
                _hover={{
                    bg: hoverBg,
                }}
                icon={<Icon color={iconColorValue} boxSize={5} as={isOpen ? PanelRightOpen : PanelRightClose} />}
            />
        </HStack>
    );
};
