import React from "react";
import {
    Box,
    VStack,
    Image,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useColorMode,
} from "@chakra-ui/react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import OnBoardingBackground from "assets/backgroundOnBoarding.png";
import OnBoardingBackgroundBlack from "assets/backgroundOnBoardingBlack.png";
import OnboardingStepper from "components/Onboarding/Stepper/OnboardingStepper";

interface OnboardingSidebarProps {
    justCompletedStep: number | null;
    isDrawerOpen: boolean;
    onDrawerClose: () => void;
}

const sidebarBg = (colorMode: string) =>
    colorMode === "dark"
        ? "linear-gradient(135deg, #0505058a 0%, #363636ff 100%)"
        : "linear-gradient(135deg,rgba(250, 255, 254, 0.72) 0%,rgb(173, 252, 231) 100%)";

const SidebarInner: React.FC<{
    justCompletedStep: number | null;
    onStepClick?: () => void;
}> = ({ justCompletedStep, onStepClick }) => {
    const { colorMode } = useColorMode();

    return (
        <>
            <Image
                src={
                    colorMode === "dark"
                        ? OnBoardingBackgroundBlack
                        : OnBoardingBackground
                }
                position="absolute"
                bottom="0"
                right="0"
                maxW="100%"
                maxH="100%"
                objectFit="contain"
                pointerEvents="none"
                zIndex={0}
                opacity={colorMode === "dark" ? 0.1 : 0.4}
            />
            <Box h="100%" zIndex={1} p={{ base: 8, md: 10, lg: 6, xl: 16 }}>
                <OnboardingStepper
                    justCompletedStep={justCompletedStep}
                    onStepClick={onStepClick}
                />
            </Box>
        </>
    );
};

const OnboardingSidebar: React.FC<OnboardingSidebarProps> = ({
    justCompletedStep,
    isDrawerOpen,
    onDrawerClose,
}) => {
    const { colorMode } = useColorMode();

    return (
        <>
            <VStack
                display={{ base: "none", xl: "flex" }}
                w={{ md: "350px", lg: "400px" }}
                bg={sidebarBg(colorMode)}
                borderTopLeftRadius="12px"
                borderBottomLeftRadius="12px"
                align="stretch"
                spacing={6}
                flex={1}
                border="1px solid"
                position="relative"
                borderColor={
                    colorMode === "dark"
                        ? currentDarkTheme.rgba.primary20
                        : "#acacac81"
                }
            >
                <SidebarInner justCompletedStep={justCompletedStep} />
            </VStack>
            <Drawer
                isOpen={isDrawerOpen}
                placement="left"
                onClose={onDrawerClose}
            >
                <DrawerOverlay />
                <DrawerContent bg={sidebarBg(colorMode)}>
                    <DrawerCloseButton
                        color={colorMode === "dark" ? "white" : "grey.900"}
                        bg={colorMode === "dark" ? "grey.800" : "white"}
                    />
                    <DrawerHeader
                        borderBottomWidth="1px"
                        bg={colorMode === "dark" ? "grey.800" : "white"}
                        borderColor={
                            colorMode === "dark"
                                ? currentDarkTheme.rgba.primary20
                                : "grey.200"
                        }
                        color={colorMode === "dark" ? "white" : "grey.900"}
                    >
                        Navigation
                    </DrawerHeader>
                    <DrawerBody p={6} bg={sidebarBg(colorMode)}>
                        <SidebarInner
                            justCompletedStep={justCompletedStep}
                            onStepClick={onDrawerClose}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default OnboardingSidebar;
