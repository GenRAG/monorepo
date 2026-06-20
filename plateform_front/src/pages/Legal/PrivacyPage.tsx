import { Divider, Stack, useColorModeValue, VStack } from "@chakra-ui/react";
import { Shield } from "lucide-react";
import { DocPageHeader } from "components/Legal/DocPageHeader";
import { DocSectionRenderer } from "components/Legal/DocSectionRenderer";
import { PRIVACY_SECTIONS } from "./data/privacy";

export const PrivacyPage = () => {
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack align="start" maxW="780px" mx="auto" px={8} py={8}>
            <DocPageHeader
                badge={{ icon: Shield, label: "Confidentialité" }}
                title="Politique de confidentialité"
                description="Cette politique décrit comment GenRAG collecte, utilise et protège vos données personnelles conformément au RGPD et à la loi Informatique et Libertés."
                date="4 juin 2026"
                readTime="~5 min de lecture"
                scope="Applicable UE / monde entier"
            />
            <Stack spacing={10} w="full">
                {PRIVACY_SECTIONS.map((section, idx) => (
                    <>
                        <DocSectionRenderer key={section.id} section={section} />
                        {idx < PRIVACY_SECTIONS.length - 1 && <Divider borderColor={borderColor} />}
                    </>
                ))}
            </Stack>
        </VStack>
    );
};
