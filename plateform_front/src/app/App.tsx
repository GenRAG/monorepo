import { Box, useColorMode } from "@chakra-ui/react";
import Router from "app/Router";
import React, { useState, useEffect } from "react";
import { AppLoader } from "components/Molecules/AppLoader";

const App: React.FC = () => {
    const [isInitializing, setIsInitializing] = useState(true);
    const { colorMode } = useColorMode();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (isInitializing) {
        return <AppLoader message="Initializing application..." />;
    }

    return (
        <Box
            bg={colorMode === "dark" ? "grey.900" : "white"}
            minH="100vh"
            display="flex"
        >
            <Router />
        </Box>
    );
};

export default App;
