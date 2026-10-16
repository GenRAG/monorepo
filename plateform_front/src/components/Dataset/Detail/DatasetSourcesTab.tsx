import { Badge, Box, Flex, HStack, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { LucideIcon, RefreshCw, Upload } from "lucide-react";
import GoogleDriveLogo from "assets/icons/google-drive.svg";
import MicrosoftLogo from "assets/icons/microsoft.svg";
import NotionLogo from "assets/icons/notion.svg";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { DocumentSourceIcon } from "components/Document/DocumentSourceIcon";
import { isGoogleDriveConfigured, useGoogleDrive } from "hooks/connector/useGoogleDrive";
import { useGetDatasetDocumentStatsQuery } from "services/document/document";
import { pluralize } from "utils/dataset/datasetStatus";

interface SourceCardProps {
    /** A generic action icon, or the brand logo of a connector. */
    icon?: LucideIcon;
    logo?: string;
    title: string;
    description: string;
    onClick?: () => void;
    isBusy?: boolean;
}

const SourceCard = ({ icon, logo, title, description, onClick, isBusy = false }: SourceCardProps) => {
    const isAvailable = !!onClick;

    return (
        <Flex
            as="button"
            type="button"
            onClick={onClick}
            disabled={!isAvailable || isBusy}
            aria-busy={isBusy}
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
                    {isBusy ? "Import…" : isAvailable ? "Disponible" : "Bientôt"}
                </Badge>
            </HStack>
            <VStack align="start" spacing={0.5}>
                <Text variant="body-sm-semibold">{title}</Text>
                <Text variant="body-xs-muted">{description}</Text>
            </VStack>
        </Flex>
    );
};

interface DatasetSourcesTabProps {
    workspaceId: string;
    datasetId: string;
    onImport: () => void;
}

/** Where documents come from: manual import, or a connector. */
export const DatasetSourcesTab = ({ workspaceId, datasetId, onImport }: DatasetSourcesTabProps) => {
    const { importFromDrive, syncDrive, isImporting, isSyncing } = useGoogleDrive(workspaceId, datasetId);
    const { data: stats } = useGetDatasetDocumentStatsQuery({ workspaceId, datasetId });
    const driveCount = stats?.countBySource?.GOOGLE_DRIVE ?? 0;

    return (
        <VStack align="stretch" spacing={4} pt={4}>
            <Text variant="body-sm-muted">
                Ajoutez des documents à la main, ou importez-les depuis les outils de votre entreprise.
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
                    description="Docs, Slides, PDF et Word de votre Drive ou d'un Drive partagé"
                    onClick={isGoogleDriveConfigured ? importFromDrive : undefined}
                    isBusy={isImporting}
                />
                <SourceCard
                    logo={MicrosoftLogo}
                    title="SharePoint / OneDrive"
                    description="Bibliothèques de documents Microsoft 365"
                />
                <SourceCard logo={NotionLogo} title="Notion" description="Pages et bases de données Notion" />
            </SimpleGrid>
            {isGoogleDriveConfigured && driveCount > 0 && (
                <Flex
                    direction={{ base: "column", md: "row" }}
                    align={{ base: "stretch", md: "center" }}
                    justify="space-between"
                    gap={3}
                    p={4}
                    bg="surfaceCard"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="borderDefault"
                    borderRadius="12px"
                >
                    <HStack spacing={3}>
                        <DocumentSourceIcon source="GOOGLE_DRIVE" size={28} />
                        <VStack align="start" spacing={0.5}>
                            <Text variant="body-sm-semibold">
                                {pluralize(driveCount, "document importé", "documents importés")} depuis Google Drive
                            </Text>
                            <Text variant="body-xs-muted">
                                Récupère la dernière version des fichiers modifiés dans Drive depuis leur import.
                            </Text>
                        </VStack>
                    </HStack>
                    <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={RefreshCw}
                        onClick={syncDrive}
                        isLoading={isSyncing}
                    >
                        Resynchroniser
                    </Button>
                </Flex>
            )}
        </VStack>
    );
};
