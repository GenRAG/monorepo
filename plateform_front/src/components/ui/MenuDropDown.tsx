import { forwardRef } from "react";
import { Menu, MenuButton, MenuList, Portal, Box, HStack, Text } from "@chakra-ui/react";
import Button, { GenragButtonProps } from "components/ui/Button";
import { ChevronDown } from "lucide-react";

interface MenuDropDownProps extends Omit<GenragButtonProps, "children"> {
    label?: string;
    children: React.ReactNode;
    variant?: string;
    triggerContent?: React.ReactNode;
}

export const MenuDropDown = forwardRef<HTMLButtonElement, MenuDropDownProps>(
    ({ label, children, variant = "secondary", triggerContent, ...props }, ref) => {
        return (
            <Menu matchWidth>
                {({ isOpen }) => (
                    <>
                        <MenuButton as={Button} variant={variant} ref={ref} {...props}>
                            {triggerContent ? (
                                triggerContent
                            ) : (
                                <HStack justify="space-between" align="center">
                                    <Text flex="1" textAlign="left">
                                        {label}
                                    </Text>
                                    <Box
                                        as={ChevronDown}
                                        size={16}
                                        color="textLabel"
                                        transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                                        transition="transform 0.2s ease-in-out"
                                        flexShrink={0}
                                    />
                                </HStack>
                            )}
                        </MenuButton>
                        <Portal>
                            <MenuList
                                p="0.5"
                                zIndex="popover"
                                w="auto"
                                minW="fit-content"
                                bg="surfaceModal"
                                borderColor="surfaceModal"
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
