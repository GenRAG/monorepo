import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    HStack,
    Stack,
    Text,
    VStack,
    Icon,
    Step,
    StepDescription,
    StepIndicator,
    StepStatus,
    StepTitle,
    Stepper,
    useColorMode,
    useBreakpointValue,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    IconButton,
    Image,
    Circle,
} from "@chakra-ui/react";
import { Check, Menu as MenuIcon } from "lucide-react";
import { useOnboarding } from "hooks/useOnBoarding";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";
import UserProfileDropdown from "components/Molecules/UserDropdownProfile";
import StepFooter from "pages/Onboarding/StepFooter";
import OnBoardingBackground from "assetsNew/backgroundOnBoarding.png";
import OnBoardingBackgroundBlack from "assetsNew/backgroundOnBoardingBlack.png";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import "./onboardingAnimations.css";

const Onboarding: React.FC = () => {
    const {
        currentStep,
        goToStep,
        goNext,
        goPrevious,
        updateStepData,
        getStepData,
        isStepValid,
        canNavigateToStep,
    } = useOnboarding();

    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const showStepper = useBreakpointValue({ base: false, xl: true });
    const isMobile = useBreakpointValue({ base: true, lg: false });

    const [_isAnimating, setIsAnimating] = useState(false);
    const [justCompletedStep, setJustCompletedStep] = useState<number | null>(
        null,
    );
    const [justActivatedStep, setJustActivatedStep] = useState<number | null>(
        null,
    );
    const prevStepRef = useRef(currentStep);
    const validateAndGoNextRef = useRef<(() => Promise<void>) | undefined>(
        undefined,
    );

    const registerValidateAndGoNext = useCallback((fn: () => Promise<void>) => {
        validateAndGoNextRef.current = fn;
    }, []);

    const handleValidateAndGoNext = useCallback(async () => {
        if (validateAndGoNextRef.current) {
            await validateAndGoNextRef.current();
        } else {
            goNext();
        }
    }, [goNext]);

    const currentStepConfig = stepsConfig[currentStep];
    const CurrentStepComponent = currentStepConfig.component;

    useEffect(() => {
        const prevStep = prevStepRef.current;
        if (prevStep !== currentStep) {
            window.scrollTo({ top: 0, behavior: "smooth" });

            setTimeout(() => {
                const mainContainer = document.querySelector(
                    "[data-onboarding-container]",
                ) as HTMLElement;
                if (mainContainer) {
                    mainContainer.scrollTo({ top: 0, behavior: "smooth" });
                }
            }, 50);

            setIsAnimating(true);
            if (currentStep > prevStep) {
                setJustCompletedStep(prevStep);
                setJustActivatedStep(currentStep);
            } else {
                setJustActivatedStep(null);
            }
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setJustCompletedStep(null);
                setJustActivatedStep(null);
            }, 1000);
            prevStepRef.current = currentStep;
            validateAndGoNextRef.current = undefined;
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    const handleLogout = () => {
        // Implement logout logic
    };

    const handleSettings = () => {
        // Implement settings logic
    };

    const handleHelp = () => {
        // Implement help logic
    };

    const StepperContent = () => (
        <Stepper
            h="100%"
            index={currentStep}
            orientation="vertical"
            gap={0}
            w="100%"
            colorScheme={
                colorMode === "dark"
                    ? currentDarkTheme.colorScheme
                    : currentDarkTheme.colorScheme
            }
            variant={
                colorMode === "dark"
                    ? currentDarkTheme.colorScheme
                    : currentDarkTheme.colorScheme
            }
        >
            {stepsConfig.map((step, index) => (
                <Step
                    key={index}
                    onClick={() => {
                        goToStep(index);
                        if (isMobile) onClose();
                    }}
                    style={{
                        opacity: canNavigateToStep(index) ? 1 : 0.8,
                        cursor: canNavigateToStep(index)
                            ? "pointer"
                            : "not-allowed",
                        position: "relative",
                    }}
                >
                    <StepIndicator
                        flexShrink={0}
                        bg={
                            index <= currentStep
                                ? colorMode === "dark"
                                    ? currentDarkTheme.primary
                                    : currentDarkTheme.primary
                                : colorMode === "dark"
                                  ? "rgba(255, 255, 255, 1)"
                                  : "white"
                        }
                        border="none"
                        transition="all 0.3s ease-in-out"
                        transform={
                            index === currentStep ? "scale(1.1)" : "scale(1)"
                        }
                        boxShadow={
                            index === currentStep
                                ? `0 0 0 4px ${colorMode === "dark" ? currentDarkTheme.rgba.primary20 : currentDarkTheme.rgba.primary20}`
                                : "none"
                        }
                        className={
                            index === justActivatedStep
                                ? "step-indicator-active"
                                : ""
                        }
                    >
                        <StepStatus
                            complete={
                                <Circle
                                    size="45px"
                                    mr="1px"
                                    bg={
                                        colorMode === "dark"
                                            ? currentDarkTheme.completeColor
                                            : currentDarkTheme.completeColor
                                    }
                                    className={
                                        index === justCompletedStep
                                            ? "step-indicator-animation"
                                            : ""
                                    }
                                >
                                    <Icon
                                        as={Check}
                                        color="white"
                                        boxSize={5}
                                    />
                                </Circle>
                            }
                            incomplete={
                                <Icon
                                    as={step.icon}
                                    color={
                                        colorMode === "dark"
                                            ? "grey.900"
                                            : "grey.500"
                                    }
                                    boxSize={5}
                                    transition="all 0.2s ease-in-out"
                                />
                            }
                            active={
                                <Icon
                                    as={step.icon}
                                    color={
                                        colorMode === "dark" ? "white" : "white"
                                    }
                                    boxSize={5}
                                    className={
                                        index === justActivatedStep
                                            ? "step-indicator-animation"
                                            : ""
                                    }
                                />
                            }
                        />
                    </StepIndicator>
                    <Box flex={1} ml={4} minW={0}>
                        <StepTitle>
                            <Text
                                fontWeight="semibold"
                                color={
                                    colorMode === "dark" ? "white" : "grey.900"
                                }
                                fontSize="md"
                            >
                                {step.title}
                            </Text>
                        </StepTitle>
                        <StepDescription
                            style={{
                                color:
                                    colorMode === "dark"
                                        ? "grey.400"
                                        : "grey.600",
                                fontSize: "xs",
                            }}
                        >
                            {step.description}
                        </StepDescription>
                    </Box>
                    <Box
                        position="absolute"
                        left="16px"
                        top="38px"
                        bottom={index === stepsConfig.length - 1 ? "auto" : "0"}
                        width="2px"
                        className="step-separator-wrapper"
                    >
                        <Box
                            position="absolute"
                            left="0"
                            top="0"
                            bottom="0"
                            width="2px"
                            style={{
                                backgroundColor: "transparent",
                                borderLeft:
                                    index >= currentStep
                                        ? `2px dashed ${colorMode === "dark" ? currentDarkTheme.rgba.primary30 : "#D1D5DB"}`
                                        : `2px solid transparent`,
                                transition:
                                    "border-color 0.6s ease-in-out, border-style 0.6s ease-in-out",
                                zIndex: 1,
                            }}
                        />
                        {index < currentStep && index !== justCompletedStep && (
                            <Box
                                className="step-separator-fill step-separator-static"
                                style={
                                    {
                                        "--separator-fill-color":
                                            colorMode === "dark"
                                                ? currentDarkTheme.hex.primary
                                                : currentDarkTheme.hex.primary,
                                        height: "100%",
                                        opacity: 1,
                                    } as React.CSSProperties
                                }
                            />
                        )}
                        {index === justCompletedStep && index < currentStep && (
                            <Box
                                key={`separator-fill-animating-${index}-${currentStep}`}
                                className="step-separator-fill"
                                style={
                                    {
                                        "--separator-fill-color":
                                            colorMode === "dark"
                                                ? currentDarkTheme.hex.primary
                                                : currentDarkTheme.hex.primary,
                                    } as React.CSSProperties
                                }
                            />
                        )}
                    </Box>
                </Step>
            ))}
        </Stepper>
    );

    return (
        <Stack
            h="100vh"
            bg={colorMode === "dark" ? "grey.900" : "grey.50"}
            spacing={0}
        >
            <HStack
                px={{ base: "16px", md: "24px" }}
                py="12px"
                bg={colorMode === "dark" ? "grey.800" : "white"}
                borderBottom="1px"
                borderColor={colorMode === "dark" ? "grey.700" : "grey.200"}
                justify="space-between"
            >
                <HStack spacing={3}>
                    {isMobile && (
                        <IconButton
                            aria-label="Open menu"
                            icon={<MenuIcon size={20} />}
                            variant="ghost"
                            onClick={onOpen}
                            color={
                                colorMode === "dark" ? "grey.300" : "grey.600"
                            }
                        />
                    )}
                    <Box
                        w="32px"
                        h="32px"
                        bg={colorMode === "dark" ? "white" : "black"}
                        borderRadius="4px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text
                            color={colorMode === "dark" ? "black" : "white"}
                            fontWeight="bold"
                            fontSize="sm"
                        >
                            G
                        </Text>
                    </Box>
                    <Text
                        fontWeight="semibold"
                        fontSize="lg"
                        color={colorMode === "dark" ? "white" : "grey.900"}
                    >
                        GenRAG
                    </Text>
                </HStack>

                <HStack spacing={4}>
                    <UserProfileDropdown
                        onLogout={handleLogout}
                        onSettings={handleSettings}
                        onHelp={handleHelp}
                    />
                </HStack>
            </HStack>
            <HStack
                w="100%"
                h="calc(100vh - 90px)"
                p={{ base: "12px", md: "24px" }}
                spacing={0}
                align="stretch"
            >
                {showStepper && (
                    <VStack
                        w={{ base: "100%", md: "350px", lg: "400px" }}
                        bg={
                            colorMode === "dark"
                                ? "linear-gradient(135deg, #0505058a 0%, #363636ff 100%)"
                                : /*'linear-gradient(135deg, #ebf4ffaf 0%, #ffe8faff 100%)'*/
                                  "linear-gradient(135deg,rgba(250, 255, 254, 0.72) 0%,rgb(173, 252, 231) 100%)"
                        }
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

                        <Box
                            h="100%"
                            zIndex={1}
                            p={{ base: 8, md: 10, lg: 6, xl: 16 }}
                        >
                            <StepperContent />
                        </Box>
                    </VStack>
                )}
                <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent
                        bg={
                            colorMode === "dark"
                                ? "linear-gradient(135deg, #050505ff 0%, #363636ff 100%)"
                                : "linear-gradient(135deg,rgba(250, 255, 254, 0.72) 0%,rgb(173, 252, 231) 100%)"
                        }
                    >
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
                        <DrawerBody
                            p={6}
                            bg={
                                colorMode === "dark"
                                    ? "linear-gradient(135deg, #0505058a 0%, #363636ff 100%)"
                                    : "linear-gradient(135deg,rgba(250, 255, 254, 0.72) 0%,rgb(173, 252, 231) 100%)"
                            }
                        >
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

                            <Box
                                h="100%"
                                zIndex={1}
                                p={{ base: 8, md: 10, lg: 6, xl: 16 }}
                            >
                                <StepperContent />
                            </Box>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                <VStack
                    flex={{ base: 1, md: 3 }}
                    bg={colorMode === "dark" ? "grey.800" : "white"}
                    align="start"
                    px={{ base: 4, md: 6, lg: 10 }}
                    pt={{ base: 4, md: 6, lg: 10 }}
                    spacing={{ base: 4, md: 8 }}
                    borderRadius={showStepper ? "0" : "12px"}
                    borderTopLeftRadius={showStepper ? "0" : "12px"}
                    borderBottomLeftRadius={showStepper ? "0" : "12px"}
                    borderTopRightRadius={"12px"}
                    borderBottomRightRadius={"12px"}
                    borderLeft={{ base: "1px solid #acacac81", xl: "none" }}
                    border="1px solid #acacac81"
                    borderColor={
                        colorMode === "dark" ? "grey.700" : "#acacac81"
                    }
                    boxShadow="sm"
                    justify="space-between"
                    overflow="hidden"
                    h="100%"
                    data-onboarding-container
                >
                    <VStack
                        h="100%"
                        align="start"
                        spacing={0}
                        w="100%"
                        justify="space-between"
                        minH={0}
                    >
                        <Stack
                            w="100%"
                            spacing={4}
                            flex={1}
                            minH={0}
                            overflow="hidden"
                        >
                            <Text
                                fontSize="sm"
                                color={
                                    colorMode === "dark"
                                        ? currentDarkTheme.primary
                                        : currentDarkTheme.primary
                                }
                                fontWeight="semibold"
                                key={`step-text-${currentStep}`}
                                className="step-text-animation"
                            >{`STEP ${currentStep + 1} OF ${stepsConfig.length}`}</Text>
                            <Box
                                key={`step-content-${currentStep}`}
                                className="step-content-animation"
                                w="100%"
                                h="100%"
                                flex={1}
                                minH={0}
                                overflowY="auto"
                                overflowX="hidden"
                                pr={4}
                                mb={4}
                            >
                                <CurrentStepComponent
                                    data={getStepData(currentStepConfig.id)}
                                    updateData={(data) =>
                                        updateStepData(
                                            currentStepConfig.id,
                                            data,
                                        )
                                    }
                                    goNext={goNext}
                                    goPrevious={goPrevious}
                                    isValid={isStepValid(currentStep)}
                                    registerValidateAndGoNext={
                                        registerValidateAndGoNext
                                    }
                                />
                            </Box>
                        </Stack>
                        <StepFooter
                            currentStep={currentStep}
                            goNext={goNext}
                            goPrevious={goPrevious}
                            onValidateAndGoNext={handleValidateAndGoNext}
                            showReassuringMessage={
                                currentStepConfig.id === "knowledge"
                            }
                        />
                    </VStack>
                </VStack>
            </HStack>
        </Stack>
    );
};

export default Onboarding;
