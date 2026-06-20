import { Box, VStack, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { LucideIcon } from "lucide-react";

interface ContactCardProps {
    icon: LucideIcon;
    category: string;
    contact: string;
    description: string;
}

export const ContactCard = ({ icon, category, contact, description }: ContactCardProps) => {
    const bg = useColorModeValue("grey.25", "grey.900");
    const border = useColorModeValue("grey.100", "grey.800");
    const categoryColor = useColorModeValue("grey.400", "grey.500");
    const contactColor = useColorModeValue("grey.900", "grey.50");
    const descColor = useColorModeValue("grey.500", "grey.400");
    const iconBg = useColorModeValue("green.50", "green.900");
    const iconColor = useColorModeValue("green.600", "green.400");

    return (
        <Box p={4} borderRadius="10px" bg={bg} border="1px solid" borderColor={border} w="100%">
            <HStack spacing={3} align="start" w="100%">
                <BoxIcon bg={iconBg} color={iconColor} icon={icon} />
                <VStack align="start" spacing={0.5}>
                    <Text
                        fontSize="10px"
                        fontWeight={700}
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        color={categoryColor}
                    >
                        {category}
                    </Text>
                    <Text fontSize="sm" fontWeight={600} color={contactColor}>
                        {contact}
                    </Text>
                    <Text fontSize="xs" color={descColor}>
                        {description}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
};
