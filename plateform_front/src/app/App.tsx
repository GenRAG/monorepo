import { Box, useColorModeValue } from "@chakra-ui/react";
import Router from "app/Router";
import React from "react";

const App: React.FC = () => {
    const backgroundColor = useColorModeValue("grey.25", "grey.975");

    return (
        <Box bg={backgroundColor} minH="100vh" display="flex">
            <Router />
        </Box>
    );
};

export default App;
