import { HStack, Text, Button, Icon, useColorModeValue } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  color: string;
  title: string;
  titleColor?: string;
  iconColor?: string;
}

export const SidebarHeader = ({
  isOpen,
  onToggle,
  color,
  title,
  titleColor = "grey.100",
  iconColor = "grey.100",
}: SidebarHeaderProps) => {

  const iconColorValue = useColorModeValue(iconColor, "grey.300");
  const hoverBg = useColorModeValue(
    currentDarkTheme.rgba.primary20,
    currentDarkTheme.rgba.primary20
  );

  return (
    <HStack justify="space-between" align="center" p={3}>
      {isOpen && (
        <Text
          fontWeight="bold"
          fontSize="xl"
          color={titleColor}
        >
          {title}
        </Text>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggle}
        aria-label="Toggle Sidebar"
        color={iconColorValue}
        _hover={{
          bg: hoverBg,
        }}
      >
        <Icon as={isOpen ? ChevronLeft : ChevronRight} />
      </Button>
    </HStack>
  );
}
