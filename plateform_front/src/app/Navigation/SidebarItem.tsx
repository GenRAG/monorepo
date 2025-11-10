import { Badge, Box, Collapse, HStack, Icon, Text, Tooltip, useColorModeValue, VStack } from "@chakra-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SidebarItemProps {
  icon: any;
  label: string;
  badge?: string;
  tag?: string;
  active?: boolean;
  open: boolean;
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
  childrenItems,
  onClick,
  expandedItem,
  setExpandedItem,
}: SidebarItemProps) => {
  const activeBg = useColorModeValue("gray.200", "#f7772da8");
  const hoverBg = useColorModeValue("gray.100", "#f5935ba8");
  const color = useColorModeValue("black", "whites.offwhite");
  const beforeColor = useColorModeValue("black", "red.400");
  const badgeColorValue = useColorModeValue("grey.500", "grey.300");
  const childLineColor = useColorModeValue("gray.200", "gray.400");
  const childTextColor = useColorModeValue("grey.600", "grey.300");
  const tooltipBg = useColorModeValue("gray.700", "white");
  const chevronColor = useColorModeValue("gray.500", "gray.300");

  const hasChildren = childrenItems && childrenItems.length > 0;
  const isExpanded = expandedItem === label;

  const handleClick = () => {
    if (hasChildren) setExpandedItem(isExpanded ? null : label);
    if (onClick) onClick();
  };

  const content = (
    <VStack align="stretch" spacing={0}>
      <HStack
        p={3}
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
          <Icon as={icon} size="18" />
          {open && (
            <Text color={color} fontSize="sm" fontWeight={active ? "semibold" : "medium"}>
              {label}
            </Text>
          )}
        </HStack>
        {open && (
          <>
            {badge && (
              <Badge colorScheme="gray" fontSize="0.7em" borderRadius="md" color={badgeColorValue}>
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

  return open ? content : <Tooltip bg={tooltipBg} borderRadius="4px" label={label}>{content}</Tooltip>;
};
