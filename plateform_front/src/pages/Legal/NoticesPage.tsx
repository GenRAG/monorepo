import { Divider, Stack, useColorModeValue, VStack } from "@chakra-ui/react";
import { Scale } from "lucide-react";
import { DocPageHeader } from "components/Legal/DocPageHeader";
import { DocSectionRenderer } from "components/Legal/DocSectionRenderer";
import { NOTICES_SECTIONS } from "./data/notices";

export const NoticesPage = () => {
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack align="start" maxW="780px" mx="auto" px={8} py={8}>
            <DocPageHeader
                badge={{ icon: Scale, label: "Légal" }}
                title="Mentions légales"
                description="Informations légales obligatoires relatives à l'éditeur de la plateforme GenRAG et à son hébergement, conformément à la loi française n°2004-575 pour la confiance dans l'économie numérique."
                date="4 juin 2026"
                readTime="~2 min de lecture"
            />
            <Stack spacing={10} w="full">
                {NOTICES_SECTIONS.map((section, idx) => (
                    <>
                        <DocSectionRenderer key={section.id} section={section} />
                        {idx < NOTICES_SECTIONS.length - 1 && <Divider borderColor={borderColor} />}
                    </>
                ))}
            </Stack>
        </VStack>
    );
};
