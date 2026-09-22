import { Card, VStack, HStack, Text } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { LucideIcon } from "lucide-react";

interface ContactCardProps {
    icon: LucideIcon;
    category: string;
    contact: string;
    description: string;
}

export const ContactCard = ({ icon, category, contact, description }: ContactCardProps) => {
    return (
        <Card size="none" borderRadius="10px" bg="secondBackgroundDefault" p={4} w="100%">
            <HStack spacing={3} align="start" w="100%">
                <BoxIcon bg="accentIconBg" color="iconAccent" icon={icon} />
                <VStack align="start" spacing={0.5}>
                    <Text
                        fontSize="10px"
                        fontWeight={700}
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        color="textMuted"
                    >
                        {category}
                    </Text>
                    <Text fontSize="sm" fontWeight={600} color="textPrimary">
                        {contact}
                    </Text>
                    <Text fontSize="xs" color="textLabel">
                        {description}
                    </Text>
                </VStack>
            </HStack>
        </Card>
    );
};
