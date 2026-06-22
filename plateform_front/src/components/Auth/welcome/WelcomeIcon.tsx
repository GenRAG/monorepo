import { Box } from "@chakra-ui/react";

const DotsGrid = () => (
    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="5px">
        {Array.from({ length: 9 }).map((_, i) => (
            <Box key={i} w="8px" h="8px" borderRadius="2px" bg="whiteAlpha.800" />
        ))}
    </Box>
);

export const WelcomeIcon = () => (
    <Box position="relative">
        <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="140px"
            h="140px"
            borderRadius="50%"
            bg="green.400"
            opacity={0.07}
            filter="blur(24px)"
        />
        <Box
            w="80px"
            h="80px"
            borderRadius="20px"
            bg="grey.900"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="green.900"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
        >
            <Box
                position="absolute"
                inset={0}
                bgGradient="linear(135deg, green.900 0%, transparent 65%)"
                opacity={0.5}
            />
            <Box position="relative" zIndex={1}>
                <DotsGrid />
            </Box>
        </Box>
    </Box>
);
