import { VStack } from "@chakra-ui/react"
import WorkspaceHeader from "components/Molecules/WorkspaceHeader"


const AnalyticsWorkspace = () => {

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <WorkspaceHeader title="Analytics" description="View data about your assistant performance and usage." />
        </VStack>
    )
}

export default AnalyticsWorkspace;