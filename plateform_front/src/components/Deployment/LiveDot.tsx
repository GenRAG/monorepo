import { Box } from "@chakra-ui/react";

export const LiveDot = () => (
    <Box
        position="relative"
        w="7px"
        h="7px"
        flexShrink={0}
        sx={{
            "@keyframes livePulse": {
                "0%, 100%": { transform: "scale(1)", opacity: 1 },
                "50%": { transform: "scale(2.4)", opacity: 0 },
            },
        }}
    >
        <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            bg="green.500"
            sx={{ animation: "livePulse 1.8s ease-in-out infinite" }}
        />
        <Box w="7px" h="7px" borderRadius="full" bg="green.500" />
    </Box>
);
