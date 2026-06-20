import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Text, VStack, HStack, useColorMode } from "@chakra-ui/react";
import { Home, ArrowLeft } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import Button from "components/ui/Button";

const NotFound: React.FC = () => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();

    return (
        <Box
            minH="100vh"
            w="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={colorMode === "dark" ? "grey.900" : "grey.100"}
            px={4}
        >
            <VStack
                spacing={8}
                maxW="600px"
                w="100%"
                align="center"
                textAlign="center"
                className="step-content-animation"
            >
                <VStack spacing={4}>
                    <Heading
                        fontSize={{ base: "120px", md: "180px" }}
                        fontWeight="bold"
                        lineHeight="1"
                        color={currentDarkTheme.primary}
                        opacity={0.9}
                        letterSpacing="-0.05em"
                    >
                        404
                    </Heading>
                    <Box w="80px" h="4px" bg={currentDarkTheme.primary} borderRadius="full" />
                </VStack>
                <VStack spacing={4} maxW="500px">
                    <Heading
                        variant="heading-2xl"
                        fontWeight="bold"
                        color={colorMode === "dark" ? "white" : "grey.900"}
                    >
                        Page pas trouvée
                    </Heading>
                    <Text fontSize="lg" color={colorMode === "dark" ? "grey.400" : "grey.600"} lineHeight="1.6">
                        La page que vous recherchez n&apos;existe pas ou a été déplacée. Retournons-vous sur la bonne
                        voie.
                    </Text>
                </VStack>
                <HStack spacing={4} flexWrap="wrap" justify="center">
                    <Button
                        variant="solid"
                        colorScheme={currentDarkTheme.colorScheme}
                        leftIcon={Home}
                        onClick={() => navigate("/")}
                        size="lg"
                    >
                        Accueil
                    </Button>
                    <Button
                        variant="outline"
                        colorScheme={currentDarkTheme.colorScheme}
                        leftIcon={ArrowLeft}
                        onClick={() => navigate(-1)}
                        size="lg"
                    >
                        Retour
                    </Button>
                </HStack>
                <Box
                    position="absolute"
                    top="20%"
                    left="10%"
                    w="200px"
                    h="200px"
                    borderRadius="full"
                    bg={currentDarkTheme.rgba.primary20}
                    filter="blur(60px)"
                    opacity={0.3}
                    zIndex={0}
                />
                <Box
                    position="absolute"
                    bottom="20%"
                    right="10%"
                    w="150px"
                    h="150px"
                    borderRadius="full"
                    bg={currentDarkTheme.rgba.primary20}
                    filter="blur(50px)"
                    opacity={0.2}
                    zIndex={0}
                />
            </VStack>
        </Box>
    );
};

export default NotFound;
