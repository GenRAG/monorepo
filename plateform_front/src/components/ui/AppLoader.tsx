import React from "react";
import { Box, VStack, Text, Image, Spinner } from "@chakra-ui/react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import logoGreen from "assets/logo/logoGreen.png";

interface AppLoaderProps {
    message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ message = "Chargement..." }) => {
    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="backgroundDefault"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
        >
            <VStack spacing={6} align="center">
                <Box position="relative" w="64px" h="64px" display="flex" alignItems="center" justifyContent="center">
                    <Spinner
                        position="absolute"
                        size="xl"
                        thickness="4px"
                        speed="0.65s"
                        color={currentDarkTheme.primary}
                    />
                    <Image src={logoGreen} alt="GenRAG" h="26px" w="26px" position="relative" zIndex={1} />
                </Box>
                <Text fontSize="sm" color="textSecondary">
                    {message}
                </Text>
            </VStack>

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.1);
                    }
                }
                .pulse-animation {
                    animation: pulse 2s ease-in-out infinite;
                }
            `}</style>
        </Box>
    );
};
