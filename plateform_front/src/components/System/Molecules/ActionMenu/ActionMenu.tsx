import {
    Box,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Tooltip,
    useColorModeValue,
} from "@chakra-ui/react";
import { MoreVertical } from "lucide-react";
import React from "react";

export interface ActionMenuItem {
    label: string;
    icon?: React.ReactElement;
    onClick: () => void;
    color?: string;
    isHidden?: boolean;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
    tooltipLabel?: string;
    "aria-label"?: string;
    trigger?: React.ReactElement;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
    items,
    tooltipLabel = "Actions",
    "aria-label": ariaLabel = "Actions",
    trigger,
}) => {
    const tooltipBg = useColorModeValue("grey.700", "green.600");
    const bg = useColorModeValue("white", "grey.900");

    const visibleItems = items.filter((item) => !item.isHidden);

    const menuButton = trigger ? (
        <MenuButton
            cursor="pointer"
            as={Box}
            display="inline-block"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
            {trigger}
        </MenuButton>
    ) : (
        <Tooltip
            label={tooltipLabel}
            bg={tooltipBg}
            color="white"
            placement="top"
            borderRadius="8px"
            hasArrow
        >
            <MenuButton
                as={IconButton}
                aria-label={ariaLabel}
                icon={<MoreVertical size={16} />}
                size="sm"
                variant="ghost"
                flexShrink={0}
                onClick={(e) => e.stopPropagation()}
            />
        </Tooltip>
    );

    return (
        <Menu>
            {menuButton}
            <MenuList onClick={(e) => e.stopPropagation()} p={0} bg={bg}>
                {visibleItems.map((item, i) => (
                    <MenuItem
                        key={item.label}
                        icon={item.icon}
                        onClick={item.onClick}
                        color={item.color}
                        fontWeight="md"
                        borderTopRadius={i === 0 ? "8px" : undefined}
                        borderBottomRadius={
                            i === visibleItems.length - 1 ? "8px" : undefined
                        }
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
};
