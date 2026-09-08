import { HStack, Image, useColorModeValue } from "@chakra-ui/react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import logoGreen from "assets/logo/logoGreen.png";
import Button from "components/ui/Button";

interface SidebarHeaderProps {
    isOpen: boolean;
    onToggle: () => void;
    color: string;
    title: string;
    iconColor?: string;
    onMobileClose?: () => void;
}

export const SidebarHeader = ({ isOpen, onToggle, title, onMobileClose }: SidebarHeaderProps) => {
    const ToggleIcon = isOpen ? PanelRightClose : PanelRightOpen;

    return (
        <HStack justify="space-between" align="center" p={3}>
            {isOpen && <Image src={logoGreen} alt={title} h="28px" w="28px" />}
            <Button
                size="sm"
                btnType="icon"
                onClick={() => {
                    onToggle();
                    if (onMobileClose) {
                        onMobileClose();
                    }
                }}
                icon={ToggleIcon}
            />
        </HStack>
    );
};
