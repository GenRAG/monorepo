import { Flex, Box, useColorModeValue } from "@chakra-ui/react";
import { Outlet, Navigate } from "react-router-dom";
import { LegalSidebar } from "app/Navigation/LegalSidebar/LegalSidebar";

export const LegalLayout = () => {
    const bg = useColorModeValue("white", "grey.975");

    return (
        <Flex h="100vh" overflow="hidden">
            <LegalSidebar />
            <Box flex={1} overflowY="auto" bg={bg}>
                <Outlet />
            </Box>
        </Flex>
    );
};

export const LegalRedirect = () => <Navigate to="/legal/privacy" replace />;
