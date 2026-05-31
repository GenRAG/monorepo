import { VStack } from "@chakra-ui/react";
import { useIsDark } from "hooks/useIsDark";
import WorkspaceHeader from "components/System/Molecules/WorkspaceHeader";
import { Settings } from "pages/Agents/Deployment/Settings";

const SettingsWorkspace = () => {
    const isDark = useIsDark();

    return (
        <VStack h="100vh" align="stretch" spacing={0} overflow="hidden" bg={isDark ? "grey.975" : "grey.50"}>
            <WorkspaceHeader title="Paramètres" description="Configurez les paramètres de votre agent." />
            <Settings />
        </VStack>
    );
};

export default SettingsWorkspace;
