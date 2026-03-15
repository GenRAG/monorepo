import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "app/AuthContext";
import { useRef } from "react";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { OnboardingProvider } from "pages/Onboarding/OnBoardingProvider";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";

const PrivateRoute: React.FC = () => {
    const { isLoggedIn, isLoading } = useAuth();
    const hasChecked = useRef(false);

    if (!isLoading) {
        hasChecked.current = true;
    }

    if (isLoading || !hasChecked.current) {
        return (
            <Flex w="100vw" h="100vh" align="center" justify="center">
                <Spinner />
            </Flex>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Flex w="100vw">
            <Box flex={1}>
                <OnboardingProvider steps={stepsConfig}>
                    <Outlet />
                </OnboardingProvider>
            </Box>
        </Flex>
    );
};

export default PrivateRoute;
