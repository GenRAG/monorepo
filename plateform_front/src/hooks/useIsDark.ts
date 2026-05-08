import { useColorMode } from "@chakra-ui/react";

export const useIsDark = (): boolean => {
    const { colorMode } = useColorMode();
    return colorMode === "dark";
};
