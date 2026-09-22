import type { ReactNode } from "react";
import { Box, Drawer, DrawerBody, DrawerContent, DrawerOverlay, IconButton } from "@chakra-ui/react";
import { Menu } from "lucide-react";

interface MobileSidebarDrawerProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    ariaLabel: string;
    bg: string;
    border: string;
    iconColor: string;
    drawerMaxW: string;
    children: ReactNode;
}

export const MobileSidebarDrawer = ({
    isOpen,
    onToggle,
    onClose,
    ariaLabel,
    bg,
    border,
    iconColor,
    drawerMaxW,
    children,
}: MobileSidebarDrawerProps) => (
    <>
        <Box
            w="48px"
            minW="48px"
            h="100vh"
            bg={bg}
            borderRight="1px solid"
            borderColor={border}
            display="flex"
            justifyContent="center"
            pt={4}
            flexShrink={0}
        >
            <IconButton
                aria-label={ariaLabel}
                icon={<Menu size={20} />}
                variant="ghost"
                color={iconColor}
                onClick={onToggle}
            />
        </Box>
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
            <DrawerOverlay />
            <DrawerContent bg={bg} maxW={drawerMaxW} borderRadius={0}>
                <DrawerBody p={0} display="flex" flexDirection="column">
                    {children}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    </>
);
