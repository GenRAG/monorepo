import { Box, HStack, useColorModeValue } from "@chakra-ui/react";
import { Download } from "lucide-react";
import { ExportCard } from "components/Deployment/ExportCard";
import SectionHeader from "components/Deployment/SectionHeader";

export const UserRights = () => {
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const bgColor = useColorModeValue("white", "grey.950");

    return (
        <Box
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            bg={bgColor}
        >
            <SectionHeader
                title="Droits d'exportation"
                subtitle="Gérez les droits d'exportation des données de votre application"
            />
            <HStack spacing={3} align="stretch" p={5}>
                <ExportCard
                    icon={<Download size={15} />}
                    title="Export des conversations"
                    subtitle="Format JSON · 1 client par fichier"
                />
                <ExportCard
                    icon={<Download size={15} />}
                    title="Export des logs API"
                    subtitle="Format CSV · 90 derniers jours"
                />
            </HStack>
        </Box>
    );
};
