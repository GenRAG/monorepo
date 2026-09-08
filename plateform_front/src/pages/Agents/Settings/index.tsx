import { VStack } from "@chakra-ui/react";
import { Settings } from "pages/Agents/Deployment/Settings";

const SettingsWorkspace = () => {
    return (
        <VStack h="100vh" align="stretch" spacing={0} overflow="hidden">
            <Settings />
        </VStack>
    );
};

export default SettingsWorkspace;
