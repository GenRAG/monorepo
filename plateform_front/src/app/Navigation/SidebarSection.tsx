import { VStack, Text, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  isOpen: boolean;
  children: ReactNode;
}

export const SidebarSection = ({ title, isOpen, children }: SidebarSectionProps) => {

  const titleColor = useColorModeValue("gray.500", "gray.400");

  return (
    <VStack align="stretch" spacing={1} mt={2}>
      <Text
        fontSize="xs"
        color={titleColor}
        px={isOpen ? 3 : 0}
        display={isOpen ? "block" : "none"}
      >
        {title}
      </Text>
      {children}
    </VStack>
  );
}
