import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import SidebarWorkspace from "app/Navigation/WorkspaceSidebar/WorkspaceSidebar";

const PrivateWorkspaceAppLayout: React.FC = () => {
    return (
        <Flex overflow="hidden">
            <SidebarWorkspace />
            <Box
                flex={1}
                minW={0}
                display="flex"
                flexDirection="column"
                overflow="hidden"
            >
                <Outlet />
            </Box>
        </Flex>
    );
};

export default PrivateWorkspaceAppLayout;
