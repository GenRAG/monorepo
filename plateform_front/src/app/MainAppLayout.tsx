import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "app/Navigation/MainSidebar/Sidebar";
import { Outlet } from "react-router-dom";

const MainAppLayout: React.FC = () => {
    return (
        <Flex minH="100vh" w="100%">
            <Sidebar />
            <Box flex={1}>
                <Outlet />
            </Box>
        </Flex>
    );
};

export default MainAppLayout;