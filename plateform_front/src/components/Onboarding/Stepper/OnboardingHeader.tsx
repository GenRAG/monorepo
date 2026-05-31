import React from "react";
import { Box, HStack, Text, useColorMode } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import Button from "components/System/Atoms/Button";
import { IconButton } from "@chakra-ui/react";
import { useAppResponsive } from "hooks/useAppResponsive";
import { Menu as MenuIcon } from "lucide-react";

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
                <Box
                    w="32px"
                    h="32px"
                    bg={colorMode === "dark" ? "white" : "black"}
                    borderRadius="4px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Text color={colorMode === "dark" ? "black" : "white"} fontWeight="bold" fontSize="sm">
                        G
                    </Text>
                </Box>
                <Text fontWeight="semibold" fontSize="lg" color={colorMode === "dark" ? "white" : "grey.900"}>
                    GenRAG
                </Text>
            </HStack>

            <Button btnType="icon" size="sm" onClick={toggleColorMode} icon={colorMode === "dark" ? Moon : Sun} />
        </HStack>
    );
};

export default OnboardingHeader;
