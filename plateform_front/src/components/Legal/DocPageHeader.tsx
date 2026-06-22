import { VStack, Text, HStack, Divider, Icon, Box, useColorModeValue, Badge } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { Calendar, Clock, Globe, LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DocPageHeaderProps {
    badge: { icon: LucideIcon; label: string };
    title: string;
    description: string;
    date: string;
    readTime: string;
    scope?: string;
}

const MetaItem = ({ icon, label }: { icon: LucideIcon; label: string }) => {
    const color = useColorModeValue("grey.400", "grey.500");
    return (
        <HStack spacing={1.5} color={color} fontSize="sm">
            <BoxIcon icon={icon} size="sm" />
            <Text>{label}</Text>
        </HStack>
    );
};

export const DocPageHeader = ({ badge, title, description, date, readTime, scope }: DocPageHeaderProps) => {
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const descColor = useColorModeValue("grey.600", "grey.400");
    const badgeBorder = useColorModeValue("green.200", "green.800");
    const badgeColor = useColorModeValue("green.400", "green.400");
    const dividerColor = useColorModeValue("grey.200", "grey.800");

    return (
        <VStack align="start" spacing={4} mb={8}>
            <HStack>
                <Badge
                    py={2}
                    variant="ghost"
                    border="1px solid"
                    borderColor={badgeBorder}
                    borderRadius="8px"
                    color={badgeColor}
                >
                    <HStack>
                        <BoxIcon icon={badge.icon} size="sm" bg={badgeColor} color="white" />
                        <Text
                            fontSize="11px"
                            fontWeight={700}
                            letterSpacing="0.08em"
                            textTransform="uppercase"
                            color={badgeColor}
                        >
                            {badge.label}
                        </Text>
                    </HStack>
                </Badge>

                <Text fontSize="3xl" fontWeight={700} color={titleColor} lineHeight={1.2}>
                    {title}
                </Text>
            </HStack>

            <Text fontSize="md" color={descColor} maxW="680px" lineHeight={1.6}>
                {description}
            </Text>

            <HStack spacing={5} flexWrap="wrap">
                <MetaItem icon={Calendar} label={date} />
                <MetaItem icon={Clock} label={readTime} />
                {scope && <MetaItem icon={Globe} label={scope} />}
            </HStack>

            <Divider borderColor={dividerColor} />
        </VStack>
    );
};
