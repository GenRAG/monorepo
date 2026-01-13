import { HStack, Text, Button, Icon, useColorModeValue } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  color: string;
}

export const SidebarHeader = ({
  isOpen,
  onToggle,
  color
}: SidebarHeaderProps) => {

  const iconColor = useColorModeValue("grey.600", "grey.300");

  return (
    <HStack justify="space-between" align="center" p={3}>
      {isOpen && (
        <Text fontWeight="bold" fontSize="xl" color={color}>
          GenRAG
        </Text>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggle}
        aria-label="Toggle Sidebar"
        color={iconColor}
      >
        <Icon as={isOpen ? ChevronLeft : ChevronRight} />
      </Button>
    </HStack>
  );
}
