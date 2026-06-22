import { useColorModeValue } from "@chakra-ui/react";
import Banner from "components/ui/Banner";
import type { ReactNode } from "react";

interface DocInfoBoxProps {
    children: ReactNode;
}

export const DocInfoBox = ({ children }: DocInfoBoxProps) => {
    const bg = useColorModeValue("green.50", "green.900");
    const border = useColorModeValue("green.200", "green.800");
    const textColor = useColorModeValue("green.800", "green.200");

    return (
        <Banner bg={bg} borderColor={border} color={textColor} variant="green" w="full">
            {children}
        </Banner>
    );
};
