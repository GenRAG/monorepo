import React from "react";
import { HStack, Image, useColorMode } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import Button from "components/ui/Button";
import { IconButton } from "@chakra-ui/react";
import { useAppResponsive } from "hooks/useAppResponsive";
import { Menu as MenuIcon } from "lucide-react";
import logoGreen from "assets/logo/logoGreen.png";

interface OnboardingHeaderProps {
    onOpenDrawer: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ onOpenDrawer }) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <HStack
            px={{ base: "16px", md: "24px" }}
            py="12px"
            bg={colorMode === "dark" ? "grey.800" : "white"}
            borderBottom="1px"
            borderColor={colorMode === "dark" ? "grey.700" : "grey.200"}
            justify="space-between"
        >
            <HStack spacing={3}>
                {isMobile && (
                    <IconButton
                        aria-label="Open menu"
                        icon={<MenuIcon size={20} />}
                        variant="ghost"
                        onClick={onOpenDrawer}
                        color={colorMode === "dark" ? "grey.300" : "grey.600"}
                    />
                )}
                <Image src={logoGreen} alt="GenRAG" h="28px" w="28px" />
            </HStack>

            <Button btnType="icon" size="sm" onClick={toggleColorMode} icon={colorMode === "dark" ? Moon : Sun} />
        </HStack>
    );
};

export default OnboardingHeader;
