import { VStack } from "@chakra-ui/react";
import WorkspaceHeader from "components/ui/WorkspaceHeader";
import { useIsDark } from "hooks/useIsDark";
import { AccessControl } from "pages/Agents/Deployment/AccessControl";

const AccessControlWorkspace = () => {
    const isDark = useIsDark();

    return (
        <VStack
            h="100vh"
            align="stretch"
            justify="center"
            spacing={0}
            overflow="hidden"
            bg={isDark ? "grey.975" : "grey.50"}
        >
            <WorkspaceHeader
                title="Contrôle d'accès"
                description="Gérez la visibilité, les membres et les clés d'API de votre agent."
            />
            <AccessControl />
        </VStack>
    );
};

export default AccessControlWorkspace;
