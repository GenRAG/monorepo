import { Divider, VStack, SimpleGrid, Text, useColorModeValue, Stack } from "@chakra-ui/react";
import { Mail, Headphones } from "lucide-react";
import { DocPageHeader } from "components/Legal/DocPageHeader";
import { DocSection } from "components/Legal/DocSection";
import { ContactCard } from "components/Legal/ContactCard";
import { ContactForm } from "components/Legal/ContactForm";

const CONTACTS = [
    {
        icon: Headphones,
        category: "Support technique",
        contact: "support@genrag.app",
        description: "Incidents, bugs & assistance produit",
    },
];

export const ContactPage = () => {
    const subColor = useColorModeValue("grey.600", "grey.400");
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack align="start" maxW="780px" mx="auto" px={8} py={8}>
            <DocPageHeader
                badge={{ icon: Mail, label: "Support" }}
                title="Nous contacter"
                description="Une question sur vos données, votre contrat ou notre plateforme ? Notre équipe vous répond sous 24h ouvrées."
                date="Réponse sous 24h ouvrées"
                readTime="FR / EN"
            />
            <Stack spacing={10}>
                <DocSection number={1} id="coordinates" title="Coordonnées directes">
                    <SimpleGrid columns={1} spacing={3}>
                        {CONTACTS.map((c) => (
                            <ContactCard
                                key={c.category}
                                icon={c.icon}
                                category={c.category}
                                contact={c.contact}
                                description={c.description}
                            />
                        ))}
                    </SimpleGrid>
                </DocSection>

                <Divider borderColor={borderColor} />

                <DocSection number={2} id="form" title="Formulaire de contact">
                    <VStack align="start" spacing={3} w="full">
                        <Text fontSize="sm" color={subColor} lineHeight={1.7}>
                            Utilisez ce formulaire pour nous adresser votre demande. Un accusé de réception vous sera
                            envoyé automatiquement.
                        </Text>
                        <ContactForm />
                    </VStack>
                </DocSection>
            </Stack>
        </VStack>
    );
};
