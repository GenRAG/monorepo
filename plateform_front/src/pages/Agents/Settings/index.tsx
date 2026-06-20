import { VStack } from "@chakra-ui/react";
import { useIsDark } from "hooks/useIsDark";
import { Settings } from "pages/Agents/Deployment/Settings";

const SettingsWorkspace = () => {
    const isDark = useIsDark();

    return (
        <VStack h="100vh" align="stretch" spacing={0} overflow="hidden" bg={isDark ? "grey.975" : "grey.50"}>
            <Settings />
        </VStack>
    );
};

export default SettingsWorkspace;
