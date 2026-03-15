import { forwardRef } from "react";
import {
    Menu,
    MenuButton,
    MenuList,
    Portal,
    Box,
    useColorMode,
    HStack,
    Text,
} from "@chakra-ui/react";
import Button, { RamifyButtonProps } from "components/Atoms/Button";
import { ChevronDown } from "lucide-react";

interface MenuDropDownProps extends Omit<RamifyButtonProps, "children"> {
    label: string;
    children: React.ReactNode;
    variant?: string;
}

export const MenuDropDown = forwardRef<HTMLButtonElement, MenuDropDownProps>(
    ({ label, children, variant = "secondary", ...props }, ref) => {
        const { colorMode } = useColorMode();

        return (
            <Menu matchWidth>
                {({ isOpen }) => (
                    <>
                        <MenuButton
                            as={Button}
                            variant={variant}
                            ref={ref}
                            {...props}
                        >
                            <HStack justify="space-between" align="center">
                                <Text flex="1" textAlign="left">
                                    {label}
                                </Text>
                                <Box
                                    as={ChevronDown}
                                    size={16}
                                    color={
                                        colorMode === "dark"
                                            ? "grey.400"
                                            : "grey.500"
                                    }
                                    transform={
                                        isOpen
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)"
                                    }
                                    transition="transform 0.2s ease-in-out"
                                    flexShrink={0}
                                />
                            </HStack>
                        </MenuButton>
                        <Portal>
                            <MenuList
                                p="0.5"
                                zIndex="popover"
                                w="auto"
                                minW="fit-content"
                                bg={colorMode === "dark" ? "grey.700" : "white"}
                                borderColor={
                                    colorMode === "dark" ? "grey.700" : "white"
                                }
                                boxShadow="lg"
                            >
                                {children}
                            </MenuList>
                        </Portal>
                    </>
                )}
            </Menu>
        );
    },
);

MenuDropDown.displayName = "MenuDropDown";

export default MenuDropDown;
