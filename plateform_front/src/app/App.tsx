import { Box, useColorModeValue } from "@chakra-ui/react";
import Router from "app/Router";
import React, { useState, useEffect } from "react";
import { AppLoader } from "components/ui/AppLoader";

const App: React.FC = () => {
    const [isInitializing, setIsInitializing] = useState(true);
    const backgroundColor = useColorModeValue("white", "grey.975");

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (isInitializing) {
        return <AppLoader message="Initialisation de l'application..." />;
    }

    return (
        <Box bg={backgroundColor} minH="100vh" display="flex">
            <Router />
        </Box>
    );
};

export default App;
