import { Box, Divider, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Check, type LucideIcon } from "lucide-react";
import Button from "components/ui/Button";

export interface PlanTier {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number | null;
    icon: LucideIcon;
    popular: boolean;
    features: string[];
    cta: string;
}

interface PlanTierCardProps {
    tier: PlanTier;
    isSelected: boolean;
    isDark: boolean;
    onSelect: (tierId: string) => void;
}

export const PlanTierCard = ({ tier, isSelected, isDark, onSelect }: PlanTierCardProps) => {
    const price = tier.monthlyPrice;

    return (
        <Box
            position="relative"
            bg={isSelected ? (isDark ? "rgba(52,211,169,0.06)" : "rgba(52,211,169,0.04)") : "surfaceCard"}
            border="1px solid"
            borderColor={
                isSelected ? "iconAccent" : tier.popular ? (isDark ? "grey.600" : "grey.300") : "borderDivider"
            }
            borderRadius="12px"
            p={5}
            cursor="pointer"
            transition="all 0.15s"
            onClick={() => onSelect(tier.id)}
            _hover={{ borderColor: "iconAccent" }}
        >
            {tier.popular && (
                <Box
                    position="absolute"
                    top="-11px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="iconAccent"
                    color="grey.900"
                    px={3}
                    py="2px"
                    borderRadius="full"
                    fontSize="9px"
                    fontWeight={700}
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    whiteSpace="nowrap"
                >
                    Populaire
                </Box>
            )}

            {isSelected && (
                <Box
                    position="absolute"
                    top="-11px"
                    left="50%"
                    transform="translateX(-50%)"
                    border="1px solid"
                    borderColor="iconAccent"
                    color="iconAccent"
                    px={3}
                    py="2px"
                    borderRadius="full"
                    fontSize="9px"
                    fontWeight={700}
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    whiteSpace="nowrap"
                    bg="surfaceCard"
                >
                    Plan actuel
                </Box>
            )}

            <VStack align="start" spacing={4}>
                <HStack spacing={2}>
                    <Box
                        w="30px"
                        h="30px"
                        borderRadius="8px"
                        bg="surfaceSubtle"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Icon as={tier.icon} boxSize={4} color={isDark ? "green.400" : "green.600"} />
                    </Box>
                    <Text fontSize="sm" fontWeight="bold" color="textStrong">
                        {tier.name}
                    </Text>
                </HStack>

                <Box>
                    {tier.monthlyPrice === null ? (
                        <Text fontSize="xl" fontWeight="bold" color="textStrong">
                            Sur-mesure
                        </Text>
                    ) : (
                        <HStack align="baseline" spacing={1}>
                            <Text fontSize="xl" fontWeight="bold" color="textStrong" letterSpacing="-0.02em">
                                {tier.monthlyPrice === 0 ? "Gratuit" : `${price} €`}
                            </Text>
                            {tier.monthlyPrice > 0 && (
                                <Text fontSize="xs" color="textLabel">
                                    /mois
                                </Text>
                            )}
                        </HStack>
                    )}
                    <Text fontSize="11px" color="textLabel" mt={0.5} lineHeight={1.4}>
                        {tier.description}
                    </Text>
                </Box>

                <Divider borderColor="borderDivider" />

                <Button
                    w="100%"
                    size="sm"
                    variant={isSelected ? undefined : "secondary"}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(tier.id);
                    }}
                >
                    {isSelected ? "Plan actuel" : tier.cta}
                </Button>

                <VStack align="start" spacing={1.5} w="100%">
                    {tier.features.map((f) => (
                        <HStack key={f} spacing={2} align="flex-start">
                            <Box p={0.5} mt="1px" bg="rgba(52,211,169,0.1)" borderRadius="full" flexShrink={0}>
                                <Check size={10} color="iconAccent" strokeWidth={3} />
                            </Box>
                            <Text fontSize="11px" color="textLabel" lineHeight={1.4}>
                                {f}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        </Box>
    );
};
