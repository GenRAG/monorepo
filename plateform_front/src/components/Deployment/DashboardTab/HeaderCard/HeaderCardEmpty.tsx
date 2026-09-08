import { Box, Card, VStack, Text, HStack } from "@chakra-ui/react";
import { ExternalLink, Globe } from "lucide-react";
import Button from "components/ui/Button";
import type { FC } from "react";

interface Props {
    onGuideClick?: () => void;
    onOpen?: () => void;
}

export const HeaderCardEmpty: FC<Props> = ({ onOpen }) => {
    return (
        <Card size="none" p={8}>
            <VStack spacing={4} align="center">
                <Box
                    w="44px"
                    h="44px"
                    borderRadius="full"
                    bg="surfaceHover"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <ExternalLink size={18} />
                </Box>

                <Text fontSize="lg" fontWeight={600} color="textPrimary">
                    Pas encore en production
                </Text>

                <Text variant="body-sm-muted" textAlign="center" maxW="640px">
                    Votre agent est prêt à être déployé en production. Cliquez sur le bouton ci-dessous pour le déployer
                    et commencer à l&apos;utiliser.
                </Text>

                <HStack spacing={4}>
                    <Button size="sm" variant="outline" leftIcon={Globe} onClick={onOpen}>
                        Déployer en production
                    </Button>
                </HStack>
            </VStack>
        </Card>
    );
};

export default HeaderCardEmpty;
