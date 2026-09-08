import { Box, VStack } from "@chakra-ui/react";
//import VisibilitySection from "components/Deployment/AccessControl/VisibilitySection";
import MembersSection from "components/Deployment/AccessControl/MembersSection";
//import ApiKeysSection from "components/Deployment/AccessControl/ApiKeysSection";

export const AccessControl = () => {
    return (
        <Box flex={1} overflowY="auto" p={6} bg="surfaceAppShell" display="flex" justifyContent="center">
            <VStack spacing={5} align="stretch" maxW="820px" w="100%">
                {/*<VisibilitySection />*/}
                <MembersSection />
                {/*<ApiKeysSection />*/}
            </VStack>
        </Box>
    );
};
