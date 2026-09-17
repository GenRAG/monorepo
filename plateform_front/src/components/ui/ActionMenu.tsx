import {
    Badge,
    Box,
    Divider,
    HStack,
    Icon,
    IconButton,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Text,
    Tooltip,
    useDisclosure,
} from "@chakra-ui/react";
import { ExternalLink, MoreVertical } from "lucide-react";
import React from "react";

export interface ActionMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    badge?: string;
    shortcut?: string;
    external?: boolean;
    danger?: boolean;
    isHidden?: boolean;
    disabled?: boolean;
}

export interface ActionMenuSection {
    label?: string;
    items: ActionMenuItem[];
}

type SlotRenderer = (ctx: { onClose: () => void }) => React.ReactNode;

interface ActionMenuProps {
    items?: ActionMenuItem[];
    sections?: ActionMenuSection[];
    header?: React.ReactNode | SlotRenderer;
    footer?: React.ReactNode | SlotRenderer;
    trigger?: React.ReactNode;
    tooltipLabel?: string;
    "aria-label"?: string;
    placement?:
        | "bottom-end"
        | "bottom-start"
        | "top-end"
        | "top-start"
        | "bottom"
        | "top"
        | "right-start"
        | "right-end"
        | "left-start"
        | "left-end";
    width?: string | number;
    fullWidth?: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
    items,
    sections,
    header,
    footer,
    trigger,
    tooltipLabel = "Actions",
    "aria-label": ariaLabel = "Actions",
    placement = "bottom-end",
    width = "220px",
    fullWidth = false,
}) => {
    const { isOpen, onClose, onToggle } = useDisclosure();

    const resolveSlot = (slot: React.ReactNode | SlotRenderer) =>
        typeof slot === "function" ? slot({ onClose }) : slot;

    const allSections: ActionMenuSection[] = sections ?? (items ? [{ items }] : []);
    const visibleSections = allSections
        .map((s) => ({ ...s, items: s.items.filter((i) => !i.isHidden) }))
        .filter((s) => s.items.length > 0);

    const triggerEl = trigger ? (
        <Box
            as="span"
            display={fullWidth ? "flex" : "inline-flex"}
            w={fullWidth ? "100%" : undefined}
            cursor="pointer"
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onToggle();
            }}
        >
            {trigger}
        </Box>
    ) : (
        <Tooltip label={tooltipLabel} bg="tooltipBg" color="white" placement="top" borderRadius="8px" hasArrow>
            <IconButton
                aria-label={ariaLabel}
                icon={<MoreVertical size={16} />}
                size="sm"
                variant="ghost"
                flexShrink={0}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
            />
        </Tooltip>
    );

    return (
        <Popover isOpen={isOpen} onClose={onClose} placement={placement} gutter={12}>
            <PopoverTrigger>
                <Box display={fullWidth ? "flex" : "inline-flex"} w={fullWidth ? "100%" : undefined}>
                    {triggerEl}
                </Box>
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    bg="surfaceModal"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="borderDefault"
                    borderRadius="12px"
                    boxShadow="0 8px 32px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.10)"
                    w={width}
                    _focus={{ outline: "none" }}
                    overflow="hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <PopoverBody p={0}>
                        {header && (
                            <>
                                {resolveSlot(header)}
                                <Divider borderColor="borderDivider" />
                            </>
                        )}

                        {visibleSections.map((section, si) => (
                            <React.Fragment key={si}>
                                {si > 0 && <Divider borderColor="borderDivider" />}
                                <Box px={2} pt={2} pb={2}>
                                    {section.label && (
                                        <Text
                                            px={2}
                                            pb={1}
                                            fontSize="10px"
                                            fontWeight="600"
                                            textTransform="uppercase"
                                            letterSpacing="0.7px"
                                            color="textFaint"
                                        >
                                            {section.label}
                                        </Text>
                                    )}
                                    {section.items.map((item, ii) => (
                                        <HStack
                                            key={ii}
                                            px={2}
                                            py="7px"
                                            borderRadius="8px"
                                            cursor="pointer"
                                            _hover={{ bg: item.danger ? "bubbleErrorBg" : "surfaceHover" }}
                                            transition="background 0.12s"
                                            justify="space-between"
                                            onClick={() => {
                                                item.onClick?.();
                                                onClose();
                                            }}
                                        >
                                            <HStack spacing={2}>
                                                {item.icon && (
                                                    <Box
                                                        color={item.danger ? "textError" : "textLabel"}
                                                        display="flex"
                                                        alignItems="center"
                                                        flexShrink={0}
                                                    >
                                                        {item.icon}
                                                    </Box>
                                                )}
                                                <Text
                                                    fontSize="13px"
                                                    color={item.danger ? "textError" : "textPrimary"}
                                                    fontWeight="400"
                                                >
                                                    {item.label}
                                                </Text>
                                            </HStack>
                                            <HStack spacing={1.5} flexShrink={0}>
                                                {item.badge && (
                                                    <Badge
                                                        fontSize="10px"
                                                        px={1.5}
                                                        py={0.5}
                                                        borderRadius="5px"
                                                        variant="subtle"
                                                        color="textLabel"
                                                        bg="surfaceThumbnail"
                                                        fontWeight="500"
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                                {item.shortcut && (
                                                    <Text fontSize="11px" color="textLabel" fontFamily="monospace">
                                                        {item.shortcut}
                                                    </Text>
                                                )}
                                                {item.external && (
                                                    <Icon as={ExternalLink} boxSize="11px" color="textLabel" />
                                                )}
                                            </HStack>
                                        </HStack>
                                    ))}
                                </Box>
                            </React.Fragment>
                        ))}

                        {footer && (
                            <>
                                <Divider borderColor="borderDivider" />
                                {resolveSlot(footer)}
                            </>
                        )}
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
};
