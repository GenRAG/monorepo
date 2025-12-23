import { Outlet } from "react-router-dom";
import Sidebar from "app/Navigation/Sidebar";
import { Box, Flex } from "@chakra-ui/react";

const PrivateAppLayout: React.FC = () => {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box flex={1} p={4}>
        <Outlet />
      </Box>
    </Flex>
  );
};

export default PrivateAppLayout;
