import { Box, VStack, Text, useColorModeValue, HStack } from "@chakra-ui/react";
import { ExternalLink, Globe } from "lucide-react";
import Button from "components/System/Atoms/Button";
import type { FC } from "react";

interface Props {
    onGuideClick?: () => void;
    onOpen?: () => void;
}

export const HeaderCardEmpty: FC<Props> = ({ onGuideClick, onOpen }) => {
    const bg = useColorModeValue("white", "grey.950");
    const iconBg = useColorModeValue("grey.50", "grey.900");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const descColor = useColorModeValue("grey.600", "grey.400");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    return (
        <Box
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            p={8}
            bg={bg}
        >
            <VStack spacing={4} align="center">
                <Box
                    w="44px"
                    h="44px"
                    borderRadius="full"
                    bg={iconBg}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <ExternalLink size={18} />
                </Box>

                <Text fontSize="lg" fontWeight={600} color={titleColor}>
                    Pas encore en production
                </Text>

                <Text
                    fontSize="sm"
                    color={descColor}
                    textAlign="center"
                    maxW="640px"
                >
                    Votre agent est prêt à être déployé en production. Cliquez
                    sur le bouton ci-dessous pour lire notre guide de mise en
                    production
                </Text>

                <HStack spacing={4}>
                    <Button
                        size="sm"
                        variant="outline"
                        leftIcon={ExternalLink}
                        onClick={onGuideClick}
                    >
                        Deployment guide
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        leftIcon={Globe}
                        onClick={onOpen}
                    >
                        Premier déploiement
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};

export default HeaderCardEmpty;
