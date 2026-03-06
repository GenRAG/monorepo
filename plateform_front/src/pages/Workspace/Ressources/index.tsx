import { VStack } from "@chakra-ui/react";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";

const RessourcesWorkspace = () => {
    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <WorkspaceHeader
                title="Ressources"
                description="View details about your assistant ressources."
            />
        </VStack>
    );
};

export default RessourcesWorkspace;
