import {
    Badge,
    Box,
    HStack,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    Portal,
    Text,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import Button from "components/ui/Button";

export interface MultiSelectOption<T extends string> {
    value: T;
    label: string;
    count?: number;
}

interface MultiSelectDropdownProps<T extends string> {
    /** Filter name shown on the button ("Type", "Source"…). */
    label: string;
    options: MultiSelectOption<T>[];
    /** Selected values; empty means no filter (everything shows). */
    value: T[];
    onChange: (value: T[]) => void;
    size?: "xs" | "sm" | "md";
}

/** Dropdown with checkboxes: stays open while options are toggled, the button shows how many are selected. */
export const MultiSelectDropdown = <T extends string>({
    label,
    options,
    value,
    onChange,
    size = "sm",
}: MultiSelectDropdownProps<T>) => (
    <Menu closeOnSelect={false} placement="bottom-start">
        {({ isOpen }) => (
            <>
                <MenuButton as={Button} variant="secondary" size={size} flexShrink={0}>
                    <HStack spacing={2}>
                        <Text as="span">{label}</Text>
                        {value.length > 0 && (
                            <Badge colorScheme="green" borderRadius="full" px={1.5}>
                                {value.length}
                            </Badge>
                        )}
                        <Box
                            as={ChevronDown}
                            size={14}
                            color="textLabel"
                            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            transition="transform 0.2s ease-in-out"
                        />
                    </HStack>
                </MenuButton>
                <Portal>
                    <MenuList
                        p="0.5"
                        zIndex="popover"
                        minW="220px"
                        bg="surfaceModal"
                        borderColor="surfaceModal"
                        boxShadow="lg"
                    >
                        <MenuOptionGroup
                            type="checkbox"
                            value={value}
                            onChange={(next) => onChange((Array.isArray(next) ? next : [next]) as T[])}
                        >
                            {options.map((option) => (
                                <MenuItemOption
                                    key={option.value}
                                    value={option.value}
                                    fontSize="sm"
                                    bg="transparent"
                                    _hover={{ bg: "surfaceHover" }}
                                >
                                    <HStack justify="space-between" spacing={4}>
                                        <Text as="span">{option.label}</Text>
                                        {option.count !== undefined && (
                                            <Text as="span" variant="body-xs-muted">
                                                {option.count}
                                            </Text>
                                        )}
                                    </HStack>
                                </MenuItemOption>
                            ))}
                        </MenuOptionGroup>
                        {value.length > 0 && (
                            <>
                                <MenuDivider borderColor="borderDefault" />
                                <MenuItem
                                    fontSize="sm"
                                    color="textLabel"
                                    bg="transparent"
                                    _hover={{ bg: "surfaceHover" }}
                                    onClick={() => onChange([])}
                                >
                                    Tout afficher
                                </MenuItem>
                            </>
                        )}
                    </MenuList>
                </Portal>
            </>
        )}
    </Menu>
);

export default MultiSelectDropdown;
