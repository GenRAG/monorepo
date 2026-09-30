import { Box, HStack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { DEMO_EASE, DEMO_SPRING } from "components/ui/demo/DemoStage";
import { DemoCountUp } from "components/ui/demo/DemoCountUp";

export const isVague = (word: string, vague: string[]) => vague.includes(word.replace(/[?,.]/g, ""));

export const VagueWord = ({ word, flagged }: { word: string; flagged: boolean }) => (
    <Box
        as="span"
        px="2px"
        mx="-2px"
        borderRadius="4px"
        bg={flagged ? "accentCardBg" : "transparent"}
        color={flagged ? "iconAccent" : "inherit"}
        fontWeight={flagged ? "semibold" : "normal"}
        textDecoration={flagged ? "underline wavy" : "none"}
        textUnderlineOffset="3px"
        transition="all 0.35s ease"
    >
        {word}{" "}
    </Box>
);

export const Tag = ({ label, strong }: { label: string; strong?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={DEMO_SPRING}
        layout
    >
        <Box
            px={2}
            py="2px"
            borderRadius="999px"
            bg={strong ? "iconAccent" : "surfaceSubtle"}
            transition="background 0.4s ease"
        >
            <Text variant="body-2xs-semibold" color={strong ? "white" : "textLabel"} whiteSpace="nowrap">
                {label}
            </Text>
        </Box>
    </motion.div>
);

export const ScoreBar = ({
    label,
    value,
    highlight,
    hovered,
}: {
    label: string;
    value: number;
    highlight?: boolean;
    hovered?: boolean;
}) => (
    <HStack spacing={2} data-demo={highlight ? "score-after" : undefined}>
        <Text variant="body-2xs-semibold" color={highlight ? "textPrimary" : "textLabel"} w="36px">
            {label}
        </Text>
        <Box
            flex={1}
            h={hovered ? "8px" : "6px"}
            borderRadius="999px"
            bg="dotInactive"
            overflow="hidden"
            transition="height 0.25s ease"
        >
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: value / 100 }}
                transition={{
                    duration: 0.9,
                    delay: highlight ? 0.25 : 0,
                    ease: DEMO_EASE,
                }}
                style={{
                    height: "100%",
                    transformOrigin: "left",
                    borderRadius: 999,
                    background: highlight ? "var(--chakra-colors-iconAccent)" : "var(--chakra-colors-textMuted)",
                }}
            />
        </Box>
        <Text variant="body-2xs-semibold" color={highlight ? "iconAccent" : "textLabel"} w="30px" textAlign="right">
            <DemoCountUp value={value} suffix="%" />
        </Text>
    </HStack>
);
