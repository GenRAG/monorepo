import React from "react";
import { Box, Card, HStack, Text, VStack } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { getGlassInk } from "components/ui/GlassNav";
import { getAgentAvatar } from "utils/agentAvatar";

interface EntityCardProps {
    title: string;
    description?: string;
    meta?: React.ReactNode;
    footer?: React.ReactNode;
    onClick: () => void;
    /**
     * "solid" (défaut) = `Card` Chakra classique, suit le colorMode de l'app (AssistantList).
     * "tinted" = panneau plein sombre à fond personnalisé (`bg`), pensé pour être posé sur un
     * conteneur déjà coloré (ex: colonnes du board Agents) — pas de blur, la carte doit juste
     * rester un ton plus claire que ce conteneur, pas "flotter" dessus comme du vrai verre.
     */
    variant?: "solid" | "tinted";
    /** Fond du variant "tinted" — ignoré pour "solid" (qui suit `surfaceModal`). */
    bg?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
    title,
    description,
    meta,
    footer,
    onClick,
    variant = "solid",
    bg = "grey.850",
}) => {
    const avatarStyle = getAgentAvatar(title);
    const isTinted = variant === "tinted";
    const ink = getGlassInk("dark");

    const body = (
        <VStack align="start" spacing={0} h="100%">
            <VStack align="start" spacing={5} p={4} flex={1} w="100%">
                <HStack spacing={3}>
                    <BoxIcon
                        size="lg"
                        letters={title.charAt(0).toUpperCase()}
                        color={avatarStyle.color}
                        bg={avatarStyle.bg}
                    />
                    <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text fontSize="sm" fontWeight="600" color={isTinted ? ink.text : "textPrimary"}>
                            {title}
                        </Text>
                        {description !== undefined && (
                            <Text
                                fontSize="sm"
                                color={isTinted ? ink.muted : "textLabel"}
                                lineHeight="1.5"
                                noOfLines={3}
                            >
                                {description || "Aucune description renseignée."}
                            </Text>
                        )}
                    </VStack>
                </HStack>
                {meta}
            </VStack>
            {footer && (
                <Box
                    w="100%"
                    px={4}
                    py={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    borderTopWidth="1px"
                    borderTopStyle="solid"
                    borderTopColor={isTinted ? "rgba(255, 255, 255, 0.12)" : "borderSubtle"}
                >
                    {footer}
                </Box>
            )}
        </VStack>
    );

    if (isTinted) {
        return (
            <Box
                bg={bg}
                borderRadius="16px"
                overflow="hidden"
                role="group"
                onClick={onClick}
                cursor="pointer"
                transition="transform 0.15s"
                _hover={{ transform: "translateY(-2px)" }}
            >
                {body}
            </Box>
        );
    }

    return (
        <Card
            size="none"
            variant="clickable"
            bg="surfaceModal"
            borderColor="borderSubtle"
            overflow="hidden"
            role="group"
            onClick={onClick}
        >
            {body}
        </Card>
    );
};
