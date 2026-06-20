import { Divider, Stack, useColorModeValue, VStack } from "@chakra-ui/react";
import { FileText } from "lucide-react";
import { DocPageHeader } from "components/Legal/DocPageHeader";
import { DocSectionRenderer } from "components/Legal/DocSectionRenderer";
import { TERMS_SECTIONS } from "./data/terms";

export const TermsPage = () => {
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack align="start" maxW="780px" mx="auto" px={8} py={8}>
            <DocPageHeader
                badge={{ icon: FileText, label: "Utilisation" }}
                title="Conditions d'utilisation"
                description="En accédant à la plateforme GenRAG, vous acceptez les présentes conditions. Lisez-les attentivement avant toute utilisation du service."
                date="4 juin 2026"
                readTime="~6 min de lecture"
            />
            <Stack spacing={10} w="full">
                {TERMS_SECTIONS.map((section, idx) => (
                    <>
                        <DocSectionRenderer key={section.id} section={section} />
                        {idx < TERMS_SECTIONS.length - 1 && <Divider borderColor={borderColor} />}
                    </>
                ))}
            </Stack>
        </VStack>
    );
};
