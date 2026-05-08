import { useState } from "react";
import {
    Box,
    HStack,
    Stack,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { Eye, EyeOff, RotateCw } from "lucide-react";
import SectionHeader from "components/Deployment/SectionHeader";
import Button from "components/System/Atoms/Button";

export const ApiKeysSection = () => {
    const [revealed, setRevealed] = useState(false);

    const containerBg = useColorModeValue("white", "grey.950");
    const sectionBg = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const keyColor = useColorModeValue("grey.400", "grey.300");
    const metaColor = useColorModeValue("grey.300", "grey.500");

    const maskedKey = "sk_live_****3a9f";
    const realKey = "sk_live_xK7mBp2nR4vL9qZ3a9f";

    return (
        <Box
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            bg={containerBg}
        >
            <SectionHeader title="Clés API" />
            <Stack spacing={4} p={4}>
                <HStack
                    justify="space-between"
                    p={3}
                    borderRadius="10px"
                    bg={sectionBg}
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <VStack align="start" spacing={0.5}>
                        <Text fontSize="sm" fontWeight={500} color={titleColor}>
                            Clé production
                        </Text>
                        <Text
                            fontSize="md"
                            fontFamily="mono"
                            color={keyColor}
                            letterSpacing="0.04em"
                        >
                            {revealed ? realKey : maskedKey}
                        </Text>
                        <Text fontSize="xs" color={metaColor}>
                            créée il y a 2 mois
                        </Text>
                    </VStack>

                    <HStack spacing={2}>
                        <Button
                            leftIcon={revealed ? EyeOff : Eye}
                            variant="outline"
                            size="xs"
                            onClick={() => setRevealed((r) => !r)}
                        >
                            {revealed ? "Masquer" : "Révéler"}
                        </Button>

                        <Button leftIcon={RotateCw} variant="outline" size="xs">
                            Régénérer
                        </Button>
                    </HStack>
                </HStack>
            </Stack>
        </Box>
    );
};

export default ApiKeysSection;
