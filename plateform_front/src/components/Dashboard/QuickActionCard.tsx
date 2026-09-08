import { Box, Card, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    onClick?: () => void;
}

export const QuickActionCard = ({ icon, title, subtitle, onClick }: QuickActionCardProps) => {
    return (
        <Card
            as="button"
            size="none"
            p={4}
            cursor="pointer"
            onClick={onClick}
            transition="border-color 0.15s, background 0.15s"
            _hover={{ bg: "surfaceHover", borderColor: "borderStrong" }}
            textAlign="left"
            w="100%"
        >
            <HStack spacing={3} align="center">
                <Box
                    bg="surfaceHover"
                    borderRadius="8px"
                    p={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <Icon as={icon} boxSize={4} color="textPrimary" />
                </Box>
                <VStack align="start" spacing={0.5}>
                    <Text variant="body-sm-semibold" lineHeight="1.2">
                        {title}
                    </Text>
                    <Text variant="body-xs-muted" lineHeight="1.3">
                        {subtitle}
                    </Text>
                </VStack>
            </HStack>
        </Card>
    );
};
