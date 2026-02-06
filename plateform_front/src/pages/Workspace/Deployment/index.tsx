import { VStack } from "@chakra-ui/react"
import WorkspaceHeader from "components/Molecules/WorkspaceHeader"


const DeploymentWorkspace = () => {

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <WorkspaceHeader title="Deployment" description="Manage the deployment of your assistant to your production environment." />
        </VStack>
    )
}

export default DeploymentWorkspace;