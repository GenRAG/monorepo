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
    useColorModeValue,
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
    placement?: "bottom-end" | "bottom-start" | "top-end" | "top-start" | "bottom" | "top" | "right-start";
    width?: string | number;
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
}) => {
    const { isOpen, onClose, onToggle } = useDisclosure();

    const popoverBg = useColorModeValue("white", "#161616");
    const popoverBorder = useColorModeValue("grey.100", "#282828");
    const sectionLabelColor = useColorModeValue("grey.400", "grey.500");
    const itemColor = useColorModeValue("grey.800", "grey.100");
    const itemHoverBg = useColorModeValue("grey.50", "whiteAlpha.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const dividerColor = useColorModeValue("grey.100", "#222");
    const badgeBg = useColorModeValue("grey.100", "grey.800");
    const dangerColor = useColorModeValue("red.500", "red.400");
    const dangerHoverBg = useColorModeValue("red.50", "rgba(239,68,68,0.08)");
    const tooltipBg = useColorModeValue("grey.700", "grey.900");

    const resolveSlot = (slot: React.ReactNode | SlotRenderer) =>
        typeof slot === "function" ? slot({ onClose }) : slot;

    const allSections: ActionMenuSection[] = sections ?? (items ? [{ items }] : []);
    const visibleSections = allSections
        .map((s) => ({ ...s, items: s.items.filter((i) => !i.isHidden) }))
        .filter((s) => s.items.length > 0);

    const triggerEl = trigger ? (
        <Box
            as="span"
            display="inline-flex"
            cursor="pointer"
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onToggle();
            }}
        >
            {trigger}
        </Box>
    ) : (
        <Tooltip label={tooltipLabel} bg={tooltipBg} color="white" placement="top" borderRadius="8px" hasArrow>
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
        <Popover isOpen={isOpen} onClose={onClose} placement={placement} gutter={6}>
            <PopoverTrigger>
                <Box display="inline-flex">{triggerEl}</Box>
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    bg={popoverBg}
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor={popoverBorder}
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
                                <Divider borderColor={dividerColor} />
                            </>
                        )}

                        {visibleSections.map((section, si) => (
                            <React.Fragment key={si}>
                                {si > 0 && <Divider borderColor={dividerColor} />}
                                <Box px={2} pt={2} pb={1}>
                                    {section.label && (
                                        <Text
                                            px={2}
                                            pb={1}
                                            fontSize="10px"
                                            fontWeight="600"
                                            textTransform="uppercase"
                                            letterSpacing="0.7px"
                                            color={sectionLabelColor}
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
                                            _hover={{ bg: item.danger ? dangerHoverBg : itemHoverBg }}
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
                                                        color={item.danger ? dangerColor : subColor}
                                                        display="flex"
                                                        alignItems="center"
                                                        flexShrink={0}
                                                    >
                                                        {item.icon}
                                                    </Box>
                                                )}
                                                <Text
                                                    fontSize="13px"
                                                    color={item.danger ? dangerColor : itemColor}
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
                                                        color={subColor}
                                                        bg={badgeBg}
                                                        fontWeight="500"
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                                {item.shortcut && (
                                                    <Text fontSize="11px" color={subColor} fontFamily="monospace">
                                                        {item.shortcut}
                                                    </Text>
                                                )}
                                                {item.external && (
                                                    <Icon as={ExternalLink} boxSize="11px" color={subColor} />
                                                )}
                                            </HStack>
                                        </HStack>
                                    ))}
                                </Box>
                            </React.Fragment>
                        ))}

                        {footer && (
                            <>
                                <Divider borderColor={dividerColor} />
                                {resolveSlot(footer)}
                            </>
                        )}
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
};
