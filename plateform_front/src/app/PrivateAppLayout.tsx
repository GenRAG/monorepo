import { Outlet } from "react-router-dom";
import Sidebar from "app/Navigation/MainSidebar/Sidebar";
import { Box, Flex } from "@chakra-ui/react";
import SidebarWorkspace from "app/Navigation/WorkspaceSidebar/WorkspaceSidebar";

const PrivateAppLayout: React.FC = () => {
  return (
    <Flex h="100vh" w="100%" overflow="hidden">
      <Sidebar />
      <SidebarWorkspace />
      <Box flex={1} minW={0} display="flex" flexDirection="column" overflow="hidden">
        <Outlet />
      </Box>
    </Flex>
  );
};

export default PrivateAppLayout;
