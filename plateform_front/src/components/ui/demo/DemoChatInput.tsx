import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { DemoCard } from "components/ui/demo/DemoStage";

export const DemoCaret = () => (
    <motion.span
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{
            duration: 1,
            repeat: Infinity,
            times: [0, 0.5, 0.5, 1],
            ease: "linear",
        }}
        style={{
            display: "inline-block",
            width: 1.5,
            height: "1em",
            marginLeft: 1,
            verticalAlign: "text-bottom",
            background: "var(--chakra-colors-iconAccent)",
        }}
    />
);

interface DemoChatInputProps {
    value: string;
    placeholder: string;
    focused: boolean;
    sendHovered: boolean;
}

export const DemoChatInput = ({ value, placeholder, focused, sendHovered }: DemoChatInputProps) => (
    <DemoCard active={focused} borderRadius="999px" pl={4} pr={1} h="40px" display="flex" alignItems="center">
        <HStack w="100%" spacing={2} data-demo="input">
            <Text variant="body-xs" flex={1} noOfLines={1} color={value ? "textPrimary" : "textMuted"}>
                {value || (!focused && placeholder)}
                {focused && <DemoCaret />}
            </Text>
            <Box
                data-demo="send"
                w="30px"
                h="30px"
                flexShrink={0}
                borderRadius="999px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={value ? "iconAccent" : "surfaceSubtle"}
                transform={sendHovered ? "scale(1.08)" : "scale(1)"}
                boxShadow={sendHovered ? "0 4px 12px rgba(18,185,140,0.35)" : "none"}
                transition="all 0.25s ease"
            >
                <Icon as={ArrowUp} boxSize="14px" color={value ? "white" : "textMuted"} />
            </Box>
        </HStack>
    </DemoCard>
);
