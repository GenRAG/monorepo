import { Box, VStack } from "@chakra-ui/react";
import DataPrivacy from "components/Deployment/Settings/DataPrivacy";
import HostingRegion from "components/Deployment/Settings/HostingRegion";
import RGPDBanner from "components/Deployment/Settings/RGPDBanner";
import { UserRights } from "components/Deployment/Settings/UserRights";
import { useIsDark } from "hooks/useIsDark";

export const Settings = () => {
    const isDark = useIsDark();

    return (
        <Box flex={1} overflowY="auto" p={6} bg={isDark ? "grey.975" : "white"}>
            <VStack spacing={5} align="stretch" maxW="820px" mx="auto">
                <RGPDBanner />
                <HostingRegion />
                <DataPrivacy />
                <UserRights />
            </VStack>
        </Box>
    );
};
