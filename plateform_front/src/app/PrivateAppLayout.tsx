import { Box } from "@chakra-ui/react";
import { GlassNavAppExample, useNavLayoutMode } from "components/ui/GlassNav";
import { Outlet } from "react-router-dom";

const PrivateAppLayout: React.FC = () => {
    const { isVertical } = useNavLayoutMode();

    return (
        <Box h="100vh" overflow="hidden">
            <GlassNavAppExample />
            {/* Pas de padding-bottom en bottom bar : le contenu défile sous la barre en verre,
            MainLayoutContainer réserve sa hauteur en fin de scroll. */}
            <Box h="100%" minW={0} overflow="hidden" pl={isVertical ? "128px" : 4}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default PrivateAppLayout;
