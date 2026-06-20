import { useState } from "react";
import { Box, HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Eye, EyeOff, Key, RotateCw } from "lucide-react";
import SectionHeader from "components/Deployment/SectionHeader";
import Button from "components/ui/Button";

export const ApiKeysSection = () => {
    const [revealed, setRevealed] = useState(false);

    const containerBg = useColorModeValue("white", "grey.950");
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const keyColor = useColorModeValue("grey.400", "grey.300");
    const metaColor = useColorModeValue("grey.300", "grey.500");

    const maskedKey = "sk_live_****3a9f";
    const realKey = "sk_live_xK7mBp2nR4vL9qZ3a9f";

    return (
        <Box borderRadius="12px" border="1px solid" borderColor={borderColor} bg={containerBg}>
            <SectionHeader
                icon={Key}
                title="Clés API"
                subtitle="Utilisé cette clé pour authentifier les requêtes à l'API"
            />
            <HStack spacing={4} p={4} justifyContent="space-between">
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="sm" fontWeight={500} color={titleColor}>
                        Clé production
                    </Text>
                    <Text fontSize="md" color={keyColor} letterSpacing="0.04em">
                        {revealed ? realKey : maskedKey}
                    </Text>
                    <Text fontSize="xs" color={metaColor}>
                        créée il y a 2 mois
                    </Text>
                </VStack>

                <HStack spacing={2}>
                    <Button leftIcon={revealed ? EyeOff : Eye} size="sm" onClick={() => setRevealed((r) => !r)}>
                        {revealed ? "Masquer" : "Révéler"}
                    </Button>

                    <Button leftIcon={RotateCw} variant="outline" size="sm">
                        Régénérer
                    </Button>
                </HStack>
            </HStack>
        </Box>
    );
};

export default ApiKeysSection;
