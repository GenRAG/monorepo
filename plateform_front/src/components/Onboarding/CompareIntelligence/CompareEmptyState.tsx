import { Badge, Box, HStack, Icon, Stack, Text, VStack } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { CARD_META } from "pages/Onboarding/steps/compareIntelligenceCards";

/** Avant la première question : les trois styles qui seront comparés. */
const CompareEmptyState = () => (
    <VStack flex={1} justify="center" spacing={5} py={4}>
        <VStack spacing={1}>
            <Text variant="body-md-semibold" textAlign="center">
                Trois styles pour une même question
            </Text>
            <Text variant="body-sm" color="textLabel" textAlign="center" maxW="360px">
                Pose une question ci-dessous : l&apos;assistant y répond de trois façons.
            </Text>
        </VStack>
        <Stack direction={{ base: "column", lg: "row" }} spacing={3} w="100%" maxW="860px">
            {CARD_META.map((card) => (
                <Box
                    key={card.key}
                    flex={1}
                    p={4}
                    bg="surfaceCard"
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor="borderDefault"
                    borderRadius="12px"
                >
                    <HStack justify="space-between" mb={3}>
                        <HStack spacing={2}>
                            <Icon as={card.icon} boxSize={4} color="iconAccent" />
                            <Text variant="body-sm-semibold" color="textStrong">
                                {card.title}
                            </Text>
                        </HStack>
                        <Badge
                            colorScheme={card.isRecommended ? "green" : "gray"}
                            variant="subtle"
                            borderRadius="full"
                            px={2}
                            textTransform="none"
                        >
                            {card.badge}
                        </Badge>
                    </HStack>
                    <VStack align="stretch" spacing={1}>
                        {card.advantages.map((advantage) => (
                            <HStack key={advantage} spacing={2}>
                                <Icon as={Check} boxSize={3} color="iconAccent" flexShrink={0} />
                                <Text variant="body-xs" color="textLabel">
                                    {advantage}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                </Box>
            ))}
        </Stack>
    </VStack>
);

export default CompareEmptyState;
