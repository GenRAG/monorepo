import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import AgentSidebar from "app/Navigation/AgentSidebar/AgentSidebar";

const PrivateAgentAppLayout: React.FC = () => {
    return (
        <Flex overflow="hidden">
            <AgentSidebar />
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

export default PrivateAgentAppLayout;
