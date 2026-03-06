import {
    Box,
    Flex,
    Heading,
    HStack,
    Icon,
    VStack,
    useColorMode,
    useColorModeValue,
    IconButton,
} from "@chakra-ui/react";

import { ArrowLeft, Moon, Sun } from "lucide-react";

import Spline from "@splinetool/react-spline";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

const AuthDesktopLayout = ({
    children,
    canGoBack,
}: {
    children: React.ReactNode;
    canGoBack?: () => void;
}) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const bgColor = useColorModeValue("white", "grey.900");
    const textColor = useColorModeValue("grey.900", "white");
    const iconColor = useColorModeValue("grey.900", "whites.offwhite");
    const toggleButtonBg = useColorModeValue("grey.100", "grey.700");
    const toggleButtonHoverBg = useColorModeValue("green.200", "green.600");

    return (
        <HStack w="100vw" h="100vh" spacing={0} overflow="hidden" bg={bgColor}>
            <VStack
                flex={2}
                h="100%"
                justify="space-between"
                align="center"
                color={textColor}
            >
                <Box w="100%" h="100%" position="relative" overflow="hidden">
                    <Spline
                        scene="https://prod.spline.design/6wq8PVEEPfkxrIjs/scene.splinecode"
                        className="w-full h-full"
                    />
                </Box>
            </VStack>
            <Heading
                position="absolute"
                top="24px"
                left="6%"
                transform="translateX(-50%)"
                zIndex={3}
                color="white"
                variant="display-2xl"
            >
                GenRAG
            </Heading>

            <Flex
                flex={1}
                h="100%"
                justify="center"
                position="relative"
                borderLeft="1px solid"
                borderColor={currentDarkTheme.rgba.primary30}
            >
                <HStack
                    position="absolute"
                    top="24px"
                    right="24px"
                    zIndex={3}
                    spacing={2}
                >
                    <IconButton
                        aria-label="Toggle color mode"
                        icon={<Icon as={colorMode === "light" ? Moon : Sun} />}
                        onClick={toggleColorMode}
                        variant="ghost"
                        bg={toggleButtonBg}
                        _hover={{ bg: toggleButtonHoverBg }}
                        color={iconColor}
                    />
                    {canGoBack && (
                        <IconButton
                            aria-label="Go back"
                            icon={<Icon as={ArrowLeft} />}
                            onClick={canGoBack}
                            variant="ghost"
                            bg={toggleButtonBg}
                            _hover={{ bg: toggleButtonHoverBg }}
                            color={iconColor}
                        />
                    )}
                </HStack>
                <Flex
                    w="100%"
                    maxW="80%"
                    direction="column"
                    gap="32px"
                    justify="center"
                >
                    {children}
                </Flex>
            </Flex>
        </HStack>
    );
};

export default AuthDesktopLayout;
