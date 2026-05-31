import {
    Box,
    Heading,
    Icon,
    Stack,
    VStack,
    useColorModeValue,
    useColorMode,
    IconButton,
    HStack,
} from "@chakra-ui/react";
import { ArrowLeft, Moon, Sun } from "lucide-react";

const AuthMobileLayout = ({
    canGoBack,
    children,
}: {
    showBackground: boolean | undefined;
    canGoBack?: () => void;
    children: React.ReactNode;
}) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const iconColor = useColorModeValue("grey.900", "whites.offwhite");
    const toggleButtonBg = useColorModeValue("grey.100", "grey.700");
    const toggleButtonHoverBg = useColorModeValue("grey.200", "grey.600");

    return (
        <Box w="100vw" py="20px">
            <Box
                position="absolute"
                top="0"
                left="0"
                w="100%"
                h="100%"
                bgColor="backgroundDefault"
                zIndex="1"
                pointerEvents="none"
            />

            <Stack direction="row" h="100%" position="relative" zIndex="2" justify="center" align="center">
                <VStack w="80%" justify="center" h="100%" spacing="32px">
                    <HStack position="absolute" top="24px" right="24px" zIndex={3} spacing={2}>
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
                    <Heading variant="heading-2xl">GenRAG</Heading>
                    <Box w="100%">{children}</Box>
                </VStack>
            </Stack>
        </Box>
    );
};

export default AuthMobileLayout;
