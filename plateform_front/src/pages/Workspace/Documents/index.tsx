import { VStack } from "@chakra-ui/react"
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";

const DocumentWorkspace = () => {

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <WorkspaceHeader title="Documents" description="Manage your documents and upload new ones. Your assistant will use these documents to answer your questions." />
        </VStack>
    )
}

export default DocumentWorkspace;