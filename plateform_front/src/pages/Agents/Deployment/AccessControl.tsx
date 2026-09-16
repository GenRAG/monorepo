import { Box, VStack } from "@chakra-ui/react";
import MembersSection from "components/Deployment/AccessControl/MembersSection";

export const AccessControl = () => {
    return (
        <Box flex={1} overflowY="auto" p={6} bg="surfaceAppShell" display="flex" justifyContent="center">
            <VStack spacing={5} align="stretch" maxW="820px" w="100%">
                <MembersSection />
            </VStack>
        </Box>
    );
};
