import { Badge, Box, Collapse, HStack, Icon, Text, Tooltip, useColorModeValue, VStack } from "@chakra-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  expandedItem: string | null;
  setExpandedItem: React.Dispatch<React.SetStateAction<string | null>>;
}

export const SidebarItem = ({
  icon,
  label,
  badge,
  tag,
  active,
  open,
  textColor = "grey.200",
  iconColor = "grey.200",
  childrenItems,
  onClick,
  expandedItem,
  setExpandedItem,
}: SidebarItemProps) => {
  const activeBg = useColorModeValue(
    currentDarkTheme.rgba.primary20,
    currentDarkTheme.rgba.primary20
  );
  const hoverBg = useColorModeValue(
    currentDarkTheme.rgba.primary20,
    currentDarkTheme.rgba.primary30
  );
  const color = useColorModeValue(textColor, "white");
  const activeColor = currentDarkTheme.primary;
  const beforeColor = currentDarkTheme.primary;
  const badgeColorValue = useColorModeValue("grey.500", "grey.300");
  const childLineColor = useColorModeValue(
    currentDarkTheme.rgba.primary20,
    currentDarkTheme.rgba.primary30
  );
  const childTextColor = useColorModeValue("grey.600", "grey.300");
  const tooltipBg = useColorModeValue("grey.700", "green.600");
  const chevronColor = useColorModeValue("grey.500", "grey.300");
  const iconColorValue = useColorModeValue(
    iconColor,
    active ? currentDarkTheme.primary : "grey.300"
  );

  const hasChildren = childrenItems && childrenItems.length > 0;
  const isExpanded = expandedItem === label;

  const handleClick = () => {
    if (hasChildren) setExpandedItem(isExpanded ? null : label);
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
        <HStack spacing={open ? 3 : 0}>
          <Icon
            as={icon}
            size="18"
            color={active ? activeColor : iconColorValue}
          />
          {open && (
            <Text
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
              <Badge colorScheme="green" fontSize="0.7em" borderRadius="8px" color={badgeColorValue}>
                {badge}
              </Badge>
            )}
            {tag && (
              <Badge colorScheme="yellow" fontSize="0.7em" borderRadius="md">
                {tag}
              </Badge>
            )}
            {hasChildren && <Icon as={isExpanded ? ChevronUp : ChevronDown} size="16" color={chevronColor} />}
          </>
        )}
      </HStack>

      {hasChildren && (
        <Collapse in={isExpanded && open}>
          <HStack align="stretch" pl={4} spacing={2} mt={1}>
            <Box w="4px" bg={childLineColor} borderRadius="9999px" mt={1} mb={1} />
            <VStack align="stretch" w="100%" spacing={1}>
              {childrenItems.map((child, i) => (
                <HStack key={i} w="100%" p={1} pl={3} borderRadius="4px" _hover={{ cursor: "pointer" }}>
                  {child.icon && <Icon as={child.icon} boxSize={3} />}
                  <Text fontSize="sm" color={childTextColor}>
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

  return open ? content : <Tooltip bg={tooltipBg} color="white" borderRadius="4px" label={label}>{content}</Tooltip>;
};
