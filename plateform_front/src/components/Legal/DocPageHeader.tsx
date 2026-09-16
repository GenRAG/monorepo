import { VStack, Text, HStack, Divider, Badge } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { Calendar, Clock, Globe, LucideIcon } from "lucide-react";

interface DocPageHeaderProps {
    badge: { icon: LucideIcon; label: string };
    title: string;
    description: string;
    date: string;
    readTime: string;
    scope?: string;
}

const MetaItem = ({ icon, label }: { icon: LucideIcon; label: string }) => {
    return (
        <HStack spacing={1.5} color="textFaint" fontSize="sm">
            <BoxIcon icon={icon} size="sm" />
            <Text>{label}</Text>
        </HStack>
    );
};

export const DocPageHeader = ({ badge, title, description, date, readTime, scope }: DocPageHeaderProps) => {
    return (
        <VStack align="start" spacing={4} mb={8}>
            <HStack>
                <Badge
                    py={2}
                    variant="ghost"
                    border="1px solid"
                    borderColor="borderAccentCardMuted"
                    borderRadius="8px"
                    color="green.400"
                >
                    <HStack>
                        <BoxIcon icon={badge.icon} size="sm" bg="green.400" color="white" />
                        <Text
                            fontSize="11px"
                            fontWeight={700}
                            letterSpacing="0.08em"
                            textTransform="uppercase"
                            color="green.400"
                        >
                            {badge.label}
                        </Text>
                    </HStack>
                </Badge>

                <Text fontSize="3xl" fontWeight={700} color="textStrong" lineHeight={1.2}>
                    {title}
                </Text>
            </HStack>

            <Text fontSize="md" color="textDescription" maxW="680px" lineHeight={1.6}>
                {description}
            </Text>

            <HStack spacing={5} flexWrap="wrap">
                <MetaItem icon={Calendar} label={date} />
                <MetaItem icon={Clock} label={readTime} />
                {scope && <MetaItem icon={Globe} label={scope} />}
            </HStack>

            <Divider borderColor="borderPanel" />
        </VStack>
    );
};
