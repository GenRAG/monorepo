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
    useColorModeValue,
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

const sidebarBgLight = "linear-gradient(135deg,rgba(250, 255, 254, 0.72) 0%,rgb(173, 252, 231) 100%)";
const sidebarBgDark = "linear-gradient(135deg, #0505058a 0%, #363636ff 100%)";

const SidebarInner: React.FC<{
    justCompletedStep: number | null;
    onStepClick?: () => void;
}> = ({ justCompletedStep, onStepClick }) => {
    const imageSrc = useColorModeValue(OnBoardingBackground, OnBoardingBackgroundBlack);
    const imageOpacity = useColorModeValue(0.4, 0.1);

    return (
        <>
            <Image
                src={imageSrc}
                position="absolute"
                bottom="0"
                right="0"
                maxW="100%"
                maxH="100%"
                objectFit="contain"
                pointerEvents="none"
                zIndex={0}
                opacity={imageOpacity}
            />
            <Box h="100%" zIndex={1} p={{ base: 8, md: 10, lg: 6, xl: 16 }}>
                <OnboardingStepper justCompletedStep={justCompletedStep} onStepClick={onStepClick} />
            </Box>
        </>
    );
};

const OnboardingSidebar: React.FC<OnboardingSidebarProps> = ({ justCompletedStep, isDrawerOpen, onDrawerClose }) => {
    const bg = useColorModeValue(sidebarBgLight, sidebarBgDark);
    const borderColor = useColorModeValue("#acacac81", currentDarkTheme.rgba.primary20);
    const closeButtonColor = useColorModeValue("grey.900", "white");
    const closeButtonBg = useColorModeValue("white", "grey.800");
    const headerBg = useColorModeValue("white", "grey.800");
    const headerBorderColor = useColorModeValue("grey.200", currentDarkTheme.rgba.primary20);
    const headerColor = useColorModeValue("grey.900", "white");

    return (
        <>
            <VStack
                display={{ base: "none", xl: "flex" }}
                w={{ md: "350px", lg: "400px" }}
                bg={bg}
                borderTopLeftRadius="12px"
                borderBottomLeftRadius="12px"
                align="stretch"
                spacing={6}
                flex={1}
                border="1px solid"
                position="relative"
                borderColor={borderColor}
            >
                <SidebarInner justCompletedStep={justCompletedStep} />
            </VStack>
            <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
                <DrawerOverlay />
                <DrawerContent bg={bg}>
                    <DrawerCloseButton color={closeButtonColor} bg={closeButtonBg} />
                    <DrawerHeader
                        borderBottomWidth="1px"
                        bg={headerBg}
                        borderColor={headerBorderColor}
                        color={headerColor}
                    >
                        Navigation
                    </DrawerHeader>
                    <DrawerBody p={6} bg={bg}>
                        <SidebarInner justCompletedStep={justCompletedStep} onStepClick={onDrawerClose} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default OnboardingSidebar;
