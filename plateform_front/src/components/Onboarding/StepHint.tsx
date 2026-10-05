import type { ReactNode } from "react";
import { Badge, HStack, Icon, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";

interface StepQuota {
    current: number;
    max: number;
    /** Unité comptée, au pluriel (ex. « questions »). */
    label: string;
}

interface StepHintProps {
    children: ReactNode;
    quota?: StepQuota;
}

const quotaColor = (remaining: number) => (remaining === 0 ? "red" : remaining === 1 ? "orange" : "gray");

/** Consigne d'une étape, avec le compteur de ce qu'il reste à utiliser. */
const StepHint = ({ children, quota }: StepHintProps) => (
    <HStack
        spacing={3}
        px={3}
        py={2.5}
        flexShrink={0}
        flexWrap={{ base: "wrap", md: "nowrap" }}
        bg="surfaceCard"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="borderSubtle"
        borderRadius="12px"
    >
        <Icon as={Info} boxSize={4} color="iconAccent" flexShrink={0} />
        <Text variant="body-xs" color="textLabel" flex={1} minW="200px">
            {children}
        </Text>
        {quota && (
            <Badge
                variant="subtle"
                colorScheme={quotaColor(Math.max(0, quota.max - quota.current))}
                borderRadius="full"
                px={2.5}
                py={0.5}
                flexShrink={0}
                textTransform="none"
            >
                {quota.current}/{quota.max} {quota.label}
            </Badge>
        )}
    </HStack>
);

export default StepHint;
