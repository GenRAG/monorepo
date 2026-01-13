import { Outlet } from "react-router-dom";
import Sidebar from "app/Navigation/Sidebar";
import { Box, Flex } from "@chakra-ui/react";
import { OnboardingProvider } from "pages/Onboarding/OnBoardingProvider";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";

const PrivateAppLayout: React.FC = () => {
  return (
    <Flex minH="100vh" w="100%">
      {/*<Sidebar />*/}
      <Box flex={1}>
        <OnboardingProvider steps={stepsConfig}>
          <Outlet />
        </OnboardingProvider>
      </Box>
    </Flex>
  );
};

export default PrivateAppLayout;
