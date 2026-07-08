import { Box, DarkMode, Flex, HStack, Icon, IconButton, Image } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import Spline from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";
import logoGreen from "assets/logo/logoGreen.png";

const fixSplineCanvas = (spline: Application) => {
    const canvas = spline.canvas as HTMLCanvasElement | undefined;
    if (!canvas) return;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
};

const AuthDesktopLayout = ({ children, canGoBack }: { children: React.ReactNode; canGoBack?: () => void }) => (
    <DarkMode>
        <HStack w="100vw" h="100vh" spacing={0} overflow="hidden" align="stretch" bg="grey.950">
            <Box flex={7} minW={0} h="100%" position="relative" overflow="hidden">
                <Spline
                    scene="https://prod.spline.design/6wq8PVEEPfkxrIjs/scene.splinecode"
                    onLoad={fixSplineCanvas}
                    className="w-full h-full"
                />
            </Box>

            <Flex
                flex={3}
                minW={0}
                h="100%"
                direction="column"
                justify="center"
                align="center"
                bg="grey.950"
                position="relative"
                borderLeft="1px solid"
                borderColor="grey.800"
            >
                {canGoBack && (
                    <HStack position="absolute" top="24px" right="24px">
                        <IconButton
                            aria-label="Go back"
                            icon={<Icon as={ArrowLeft} />}
                            onClick={canGoBack}
                            variant="ghost"
                            color="grey.400"
                            _hover={{ bg: "grey.800" }}
                        />
                    </HStack>
                )}
                <Flex w="100%" maxW="80%" direction="column" gap="32px" justify="center">
                    {children}
                </Flex>
            </Flex>

            <Image src={logoGreen} alt="GenRAG" position="absolute" top="24px" left="24px" zIndex={3} h="36px" />
        </HStack>
    </DarkMode>
);

export default AuthDesktopLayout;
