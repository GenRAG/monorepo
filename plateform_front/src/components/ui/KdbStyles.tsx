import { Box, useColorModeValue } from "@chakra-ui/react";

interface StyledKbdProps {
    children: React.ReactNode;
}

export const StyledKbd = ({ children }: StyledKbdProps) => {
    const bg = useColorModeValue("white", "grey.750");
    const shadow = useColorModeValue("0 2px 0 0 #CBD5E0", "0 2px 0 0 #2D3748");

    return (
        <Box
            as="kbd"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            minW="20px"
            h="20px"
            px="6px"
            bg={bg}
            color="textLabel"
            fontSize="10px"
            fontWeight={600}
            fontFamily="mono"
            letterSpacing="0.02em"
            border="1px solid"
            borderColor="borderStrong"
            borderRadius="5px"
            boxShadow={shadow}
            lineHeight={1}
            userSelect="none"
        >
            {children}
        </Box>
    );
};

export default StyledKbd;
