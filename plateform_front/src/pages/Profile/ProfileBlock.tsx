import type { FormEventHandler, ReactNode } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

interface ProfileBlockProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    /** Actions en pied de bloc (Annuler / Enregistrer). */
    footer?: ReactNode;
    /** Le bloc devient le `<form>` quand il en a un. */
    onSubmit?: FormEventHandler;
}

/** Bloc d'un onglet du profil, sans cadre : la modal sépare les blocs par des dividers. */
export const ProfileBlock = ({ title, subtitle, children, footer, onSubmit }: ProfileBlockProps) => (
    <VStack as={onSubmit ? "form" : "section"} onSubmit={onSubmit} align="stretch" spacing={4}>
        <Box>
            <Text variant="body-md-semibold">{title}</Text>
            <Text variant="body-xs-muted">{subtitle}</Text>
        </Box>
        {children}
        {footer && (
            <HStack justify="flex-end" spacing={3}>
                {footer}
            </HStack>
        )}
    </VStack>
);
