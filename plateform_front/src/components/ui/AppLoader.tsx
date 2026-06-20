import React from "react";
import { Box, VStack, Text, Spinner } from "@chakra-ui/react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface AppLoaderProps {
    message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ message = "Loading..." }) => {
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
                <Box position="relative">
                    <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                        <Spinner size="xl" thickness="4px" speed="0.65s" color={currentDarkTheme.primary} />
                    </Box>
                </Box>
                <VStack spacing={2} align="center">
                    <Text fontSize="xl" fontWeight="semibold" color="textPrimary">
                        GenRAG
                    </Text>
                    <Text fontSize="sm" color="textSecondary">
                        {message}
                    </Text>
                </VStack>
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
