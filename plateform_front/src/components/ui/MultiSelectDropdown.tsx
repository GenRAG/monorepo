import {
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

export interface MultiSelectOption<T extends string> {
    value: T;
    label: string;
    count?: number;
    /** Shown before the label (logo, file type tile…). */
    icon?: React.ReactNode;
}

interface MultiSelectDropdownProps<T extends string> {
    /** Filter name shown on the button ("Type", "Source"…). */
    label: string;
    options: MultiSelectOption<T>[];
    /** Selected values; empty means no filter (everything shows). */
    value: T[];
    onChange: (value: T[]) => void;
}

/** Dropdown with checkboxes: stays open while options are toggled, the button shows how many are selected. */
export const MultiSelectDropdown = <T extends string>({
    label,
    options,
    value,
    onChange,
}: MultiSelectDropdownProps<T>) => (
    <Menu variant="glass" closeOnSelect={false} placement="bottom-start" gutter={6}>
        {({ isOpen }) => (
            <>
                <MenuButton flexShrink={0}>
                    <HStack spacing={2}>
                        <Text as="span">{label}</Text>
                        {value.length > 0 && (
                            <Box
                                as="span"
                                minW="18px"
                                h="18px"
                                px={1.5}
                                borderRadius="full"
                                bg="accentBadgeBg"
                                color="accentBadgeText"
                                fontSize="11px"
                                fontWeight="bold"
                                lineHeight="18px"
                                textAlign="center"
                            >
                                {value.length}
                            </Box>
                        )}
                        <Box
                            as={ChevronDown}
                            size={14}
                            opacity={0.6}
                            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            transition="transform 0.2s ease-in-out"
                        />
                    </HStack>
                </MenuButton>
                <Portal>
                    <MenuList zIndex="popover">
                        <MenuOptionGroup
                            type="checkbox"
                            value={value}
                            onChange={(next) => onChange((Array.isArray(next) ? next : [next]) as T[])}
                        >
                            {options.map((option) => (
                                <MenuItemOption key={option.value} value={option.value}>
                                    <HStack spacing={2.5}>
                                        {option.icon}
                                        <Text as="span" flex={1}>
                                            {option.label}
                                        </Text>
                                        {option.count !== undefined && (
                                            <Text as="span" fontSize="xs" opacity={0.55}>
                                                {option.count}
                                            </Text>
                                        )}
                                    </HStack>
                                </MenuItemOption>
                            ))}
                        </MenuOptionGroup>
                        {value.length > 0 && (
                            <>
                                <MenuDivider />
                                <MenuItem opacity={0.7} onClick={() => onChange([])}>
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
