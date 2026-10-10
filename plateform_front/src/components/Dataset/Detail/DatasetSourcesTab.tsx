import { Badge, Box, Flex, HStack, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { LucideIcon, Upload } from "lucide-react";
import GoogleDriveLogo from "assets/icons/google-drive.svg";
import MicrosoftLogo from "assets/icons/microsoft.svg";
import NotionLogo from "assets/icons/notion.svg";
import BoxIcon from "components/ui/BoxIcon";

interface SourceCardProps {
    /** A generic action icon, or the brand logo of a connector. */
    icon?: LucideIcon;
    logo?: string;
    title: string;
    description: string;
    onClick?: () => void;
}

const SourceCard = ({ icon, logo, title, description, onClick }: SourceCardProps) => {
    const isAvailable = !!onClick;

    return (
        <Flex
            as="button"
            type="button"
            onClick={onClick}
            disabled={!isAvailable}
            direction="column"
            align="start"
            textAlign="left"
            gap={3}
            p={4}
            bg="surfaceCard"
            borderWidth="1px"
            borderStyle="solid"
            borderColor={isAvailable ? "borderAccentCard" : "borderDefault"}
            borderRadius="12px"
            opacity={isAvailable ? 1 : 0.6}
            cursor={isAvailable ? "pointer" : "not-allowed"}
            _hover={isAvailable ? { bg: "surfaceHover", borderColor: "borderAccentCardActive" } : undefined}
            transition="all 0.15s"
        >
            <HStack justify="space-between" w="100%">
                {logo ? (
                    // White tile so dark logos (Notion) stay visible in dark mode.
                    <Box w="36px" h="36px" p="7px" borderRadius="8px" bg="white" flexShrink={0}>
                        <Image src={logo} alt="" w="100%" h="100%" objectFit="contain" />
                    </Box>
                ) : (
                    <BoxIcon icon={icon} />
                )}
                <Badge colorScheme={isAvailable ? "green" : "gray"} size="sm">
                    {isAvailable ? "Disponible" : "Bientôt"}
                </Badge>
            </HStack>
            <VStack align="start" spacing={0.5}>
                <Text variant="body-sm-semibold">{title}</Text>
                <Text variant="body-xs-muted">{description}</Text>
            </VStack>
        </Flex>
    );
};

/** Where documents come from. Only the manual import exists today; connectors will plug in here. */
export const DatasetSourcesTab = ({ onImport }: { onImport: () => void }) => (
    <VStack align="stretch" spacing={4} pt={4}>
        <Text variant="body-sm-muted">
            Ajoutez des documents à la main, ou bientôt synchronisez-les depuis les outils de votre entreprise.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
            <SourceCard
                icon={Upload}
                title="Import manuel"
                description="PDF, Word, Markdown, texte ou HTML depuis votre ordinateur"
                onClick={onImport}
            />
            <SourceCard
                logo={GoogleDriveLogo}
                title="Google Drive"
                description="Docs, Sheets et PDF d'un Drive partagé"
            />
            <SourceCard
                logo={MicrosoftLogo}
                title="SharePoint / OneDrive"
                description="Bibliothèques de documents Microsoft 365"
            />
            <SourceCard logo={NotionLogo} title="Notion" description="Pages et bases de données Notion" />
        </SimpleGrid>
    </VStack>
);
