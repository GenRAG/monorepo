import {
    Badge,
    Box,
    Collapse,
    HStack,
    Icon,
    Text,
    Tooltip,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface SidebarItemProps {
    icon: any;
    label: string;
    badge?: string;
    tag?: string;
    active?: boolean;
    open: boolean;
    textColor?: string;
    iconColor?: string;
    childrenItems?: { label: string; icon?: any; onClick?: () => void }[];
    badgeColor?: string;
    onClick?: () => void;
}

export const SidebarItem = ({
    icon,
    label,
    badge,
    tag,
    active,
    open,
    textColor = "white",
    iconColor = "grey.200",
    childrenItems,
    onClick,
    //expandedItem,
    //setExpandedItem,
}: SidebarItemProps) => {
    const activeBg = useColorModeValue(
        currentDarkTheme.rgba.primary20,
        currentDarkTheme.rgba.primary20,
    );
    const hoverBg = useColorModeValue(
        currentDarkTheme.rgba.primary20,
        currentDarkTheme.rgba.primary30,
    );
    const color = useColorModeValue(textColor, "white");
    const activeColor = currentDarkTheme.primary500;
    const beforeColor = currentDarkTheme.primary;
    const badgeColorValue = useColorModeValue("grey.500", "grey.300");
    const childLineColor = useColorModeValue("grey.800", "grey.800");
    const childTextColor = useColorModeValue("grey.300", "grey.300");
    const tooltipBg = useColorModeValue("grey.700", "green.600");
    const chevronColor = useColorModeValue("grey.500", "grey.300");
    const iconColorValue = useColorModeValue(
        iconColor,
        active ? currentDarkTheme.primary : "grey.300",
    );

    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const hasChildren = childrenItems && childrenItems.length > 0;
    const isExpanded = expandedItem === label;

    const handleClick = () => {
        if (onClick) onClick();
    };

    const content = (
        <VStack align="stretch">
            <HStack
                p={4}
                position="relative"
                bg={active ? activeBg : "transparent"}
                _hover={{ bg: hoverBg, cursor: "pointer" }}
                justify={open ? "space-between" : "center"}
                overflow="hidden"
                onClick={handleClick}
                aria-label={label}
                align="center"
                _before={{
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "3.5px",
                    bg: active ? beforeColor : "transparent",
                    borderTopRightRadius: "9999px",
                    borderBottomRightRadius: "9999px",
                }}
            >
                <HStack spacing={open ? 3 : 0} alignItems="center">
                    <Icon
                        as={icon}
                        size="18"
                        color={active ? activeColor : iconColorValue}
                    />
                    {open && (
                        <Text
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClick) onClick();
                            }}
                            color={active ? activeColor : color}
                            fontSize="sm"
                            fontWeight={active ? "semibold" : "medium"}
                        >
                            {label}
                        </Text>
                    )}
                </HStack>
                {open && (
                    <>
                        {badge && (
                            <Badge
                                colorScheme="green"
                                fontSize="0.7em"
                                borderRadius="full"
                                w="20px"
                                h="20px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color={badgeColorValue}
                            >
                                {badge}
                            </Badge>
                        )}
                        {tag && (
                            <Badge
                                colorScheme="yellow"
                                fontSize="0.7em"
                                borderRadius="md"
                            >
                                {tag}
                            </Badge>
                        )}
                        {hasChildren && (
                            <Icon
                                as={isExpanded ? ChevronUp : ChevronDown}
                                w={6}
                                h={6}
                                color={chevronColor}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedItem(isExpanded ? null : label);
                                }}
                            />
                        )}
                    </>
                )}
            </HStack>

            {hasChildren && (
                <Collapse in={isExpanded && open}>
                    <HStack align="stretch" pl={4} spacing={2} mt={1} mb={4}>
                        <Box
                            w="1.5px"
                            bg={childLineColor}
                            borderRadius="0px"
                            pb={4}
                            mr={2}
                        />
                        <VStack
                            align="stretch"
                            w="100%"
                            spacing={1}
                            alignItems="center"
                            verticalAlign="center"
                        >
                            {childrenItems.map((child, i) => (
                                <HStack
                                    key={i}
                                    w="100%"
                                    p={2}
                                    mr={4}
                                    borderRadius="4px"
                                    aria-label={child.label}
                                    alignItems="center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (child.onClick) child.onClick();
                                    }}
                                    _hover={{ cursor: "pointer", bg: hoverBg }}
                                >
                                    {child.icon && (
                                        <Icon
                                            as={child.icon}
                                            boxSize={4}
                                            color={"grey.200"}
                                        />
                                    )}
                                    <Text
                                        fontSize="sm"
                                        textAlign="center"
                                        color={childTextColor}
                                    >
                                        {child.label}
                                    </Text>
                                </HStack>
                            ))}
                        </VStack>
                    </HStack>
                </Collapse>
            )}
        </VStack>
    );

    return open ? (
        content
    ) : (
        <Tooltip
            placement="right"
            color="white"
            borderRadius="8px"
            hasArrow
            bg={tooltipBg}
            label={label}
        >
            {content}
        </Tooltip>
    );
};
