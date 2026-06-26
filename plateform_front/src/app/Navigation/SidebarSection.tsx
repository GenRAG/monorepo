import { VStack, Text, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface SidebarSectionProps {
    title: string;
    isOpen: boolean;
    children: ReactNode;
}

export const SidebarSection = ({ title, isOpen, children }: SidebarSectionProps) => {
    const titleColor = useColorModeValue("grey.600", "grey.400");

    return (
        <VStack align="stretch" spacing={0} mt={isOpen ? 2 : 0}>
            <Text
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="0.5px"
                textTransform="uppercase"
                color={titleColor}
                px={isOpen ? 3 : 0}
                display={isOpen ? "block" : "none"}
                mb={isOpen ? 4 : 0}
                mt={isOpen ? 4 : 0}
            >
                {title}
            </Text>
            {children}
        </VStack>
    );
};
