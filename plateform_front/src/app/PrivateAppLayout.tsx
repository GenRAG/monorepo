import { Box } from "@chakra-ui/react";
import { GlassNavAppExample, useNavLayoutMode } from "components/ui/GlassNav";
import { Outlet } from "react-router-dom";

const PrivateAppLayout: React.FC = () => {
    const { isVertical } = useNavLayoutMode();

    return (
        <Box h="100vh" overflow="hidden">
            <GlassNavAppExample />
            <Box
                h="100%"
                minW={0}
                overflow="hidden"
                pl={isVertical ? "128px" : 4}
                pb={isVertical ? 0 : "calc(84px + env(safe-area-inset-bottom, 0px))"}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default PrivateAppLayout;
