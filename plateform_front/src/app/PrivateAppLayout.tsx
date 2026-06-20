import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "app/Navigation/MainSidebar/Sidebar";
import { Outlet } from "react-router-dom";

const PrivateAppLayout: React.FC = () => {
    return (
        <Flex flex={1} minW={0} h="100vh" overflow="hidden">
            <Sidebar />
            <Box flex={1} minW={0} overflow="hidden">
                <Outlet />
            </Box>
        </Flex>
    );
};

export default PrivateAppLayout;
