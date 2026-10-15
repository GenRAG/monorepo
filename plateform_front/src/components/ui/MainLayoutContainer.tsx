import { ReactNode } from "react";
import { Box, Stack } from "@chakra-ui/react";
import { useNavLayoutMode } from "components/ui/GlassNav";

interface MainLayoutContainerProps {
    header?: ReactNode;
    body: ReactNode;
}

export const MainLayoutContainer = ({ header, body }: MainLayoutContainerProps) => {
    const { isVertical } = useNavLayoutMode();

    return (
        <Stack
            spacing={10}
            pt={{ base: 4, lg: 6 }}
            pl={{ base: 20, lg: 28 }}
            pr={{ base: 28, lg: 40 }}
            gap={10}
            overflow="auto"
            h="100vh"
        >
            {header}
            <Stack gap={4} flex={1}>
                {body}
                {/* Vrai spacer DOM plutôt qu'un padding-bottom sur le Stack racine : un
                `overflow=auto` flex avec un enfant flex imbriqué ne respecte pas son
                padding-bottom en fin de scroll dans Chrome (bug connu) — le dernier contenu
                touche alors le bas sans marge. En bottom bar, il couvre aussi la barre
                (84px + safe area) que le contenu survole. */}
                <Box
                    h={isVertical ? { base: 4, lg: 6 } : "calc(108px + env(safe-area-inset-bottom, 0px))"}
                    flexShrink={0}
                />
            </Stack>
        </Stack>
    );
};
