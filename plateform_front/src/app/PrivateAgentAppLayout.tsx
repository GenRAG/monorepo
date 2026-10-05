import { Outlet } from "react-router-dom";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import AgentSidebar from "app/Navigation/AgentSidebar/AgentSidebar";
import { AmbientGlow } from "components/ui/AmbientGlow";

const PrivateAgentAppLayout: React.FC = () => {
    // `surfaceAppShell` vaut en fait la même couleur que `secondBackgroundDefault` en dark mode
    // (grey.950 des deux côtés, malgré ce que son nom laisse penser) : la marge autour de la page
    // serait donc invisible avec ce token. `grey.975` est un cran plus sombre pour de vrai.
    const ambientBg = useColorModeValue("grey.100", "grey.975");

    return (
        <Flex overflow="hidden" position="relative" zIndex={0} h="100vh" bg={ambientBg}>
            <AmbientGlow />
            <AgentSidebar />
            <Box flex={1} minW={0} p={3} display="flex" flexDirection="column" overflow="hidden">
                <Box
                    flex={1}
                    minW={0}
                    display="flex"
                    flexDirection="column"
                    overflow="hidden"
                    bg="agentBackgroundDefault"
                    borderRadius="20px"
                >
                    <Outlet />
                </Box>
            </Box>
        </Flex>
    );
};

export default PrivateAgentAppLayout;
