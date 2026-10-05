import React from "react";
import { Box, Flex, Text, VStack, useColorModeValue, useToken } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { GenragLoader, LOADER_LOOP_S, useLoaderPhase } from "components/ui/GenragLoader";

/** Chaque lettre monte, s'éclaire, puis redescend ; le décalage entre lettres fait courir un reflet. */
const wave = keyframes`
    0%, 55%, 100% { transform: translateY(0); color: var(--loader-text-rest); }
    28% { transform: translateY(-4px); color: var(--loader-text-shine); }
`;

const LETTER_DELAY_S = 0.06;

const LoadingText = ({ text }: { text: string }) => {
    const [rest, shine] = useToken("colors", useColorModeValue(["grey.400", "grey.900"], ["grey.500", "white"]));
    const phase = useLoaderPhase();

    return (
        <Text
            variant="body-sm"
            role="status"
            aria-label={text}
            color={rest}
            sx={{
                "--loader-text-rest": rest,
                "--loader-text-shine": shine,
                "& span": {
                    display: "inline-block",
                    whiteSpace: "pre",
                    animation: `${wave} ${LOADER_LOOP_S}s ease-in-out infinite`,
                },
                "@media (prefers-reduced-motion: reduce)": {
                    "& span": { animation: "none" },
                },
            }}
        >
            {Array.from(text).map((letter, i) => (
                <Box as="span" key={i} aria-hidden style={{ animationDelay: `${i * LETTER_DELAY_S - phase}s` }}>
                    {letter}
                </Box>
            ))}
        </Text>
    );
};

interface AppLoaderProps {
    message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ message = "Chargement..." }) => {
    // Même fond que les sections agent et onboarding, avec un halo derrière le logo.
    const bg = useColorModeValue("grey.100", "grey.975");

    return (
        <Flex
            position="fixed"
            inset={0}
            zIndex={9999}
            align="center"
            justify="center"
            bg={bg}
            backgroundImage="radial-gradient(420px circle at 50% 46%, rgba(18, 185, 140, 0.16), transparent 70%)"
        >
            <VStack spacing={7}>
                <GenragLoader />
                <LoadingText text={message} />
            </VStack>
        </Flex>
    );
};
