import React from 'react';
import {
    Box,
    VStack,
    Text,
    useColorMode,
    Icon,
    Spinner,
} from '@chakra-ui/react';
import { Sparkles } from 'lucide-react';
import { currentDarkTheme } from 'themeNew/foundations/themeConfig';

interface AppLoaderProps {
    message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
    message = 'Loading...'
}) => {
    const { colorMode } = useColorMode();

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={colorMode === 'dark' ? 'grey.900' : 'white'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
        >
            <VStack spacing={6} align="center">
                <Box position="relative">
                    <Icon
                        as={Sparkles}
                        boxSize={12}
                        color={currentDarkTheme.primary}
                        className="pulse-animation"
                    />
                    <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                    >
                        <Spinner
                            size="xl"
                            thickness="4px"
                            speed="0.65s"
                            color={currentDarkTheme.primary}
                            emptyColor={colorMode === 'dark' ? 'grey.700' : 'grey.200'}
                        />
                    </Box>
                </Box>
                <VStack spacing={2} align="center">
                    <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        color={colorMode === 'dark' ? 'white' : 'grey.900'}
                    >
                        GenRAG
                    </Text>
                    <Text
                        fontSize="sm"
                        color={colorMode === 'dark' ? 'grey.400' : 'grey.600'}
                    >
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

