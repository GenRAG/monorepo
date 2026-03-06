import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "app/Navigation/MainSidebar/Sidebar";
import { Outlet } from "react-router-dom";

const PrivateAppLayout: React.FC = () => {
    return (
        <Flex overflow="hidden">
            <Sidebar />
            <Box flex={1}>
                <Outlet />
            </Box>
        </Flex>
    );
};

export default PrivateAppLayout;
