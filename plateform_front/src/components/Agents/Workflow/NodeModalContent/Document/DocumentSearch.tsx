import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { DEMO_EASE, DEMO_SPRING, DemoCard } from "components/ui/demo/DemoStage";
import { DemoCaret } from "components/ui/demo/DemoChatInput";
import type { DocumentSceneState } from "./DocumentAnimation";

export const QueryPoint = ({ x, y }: { x: number; y: number }) => (
    <Box position="absolute" left={`${x}%`} top={`${y}%`}>
        <motion.div
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 0.18 }}
            transition={{ duration: 0.9, ease: DEMO_EASE }}
            style={{
                position: "absolute",
                width: 96,
                height: 96,
                left: -48,
                top: -48,
                borderRadius: 999,
                background: "var(--chakra-colors-iconAccent)",
            }}
        />
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.5 }}
            style={{
                position: "absolute",
                width: 12,
                height: 12,
                left: -6,
                top: -6,
                borderRadius: 999,
                background: "var(--chakra-colors-iconAccent)",
                boxShadow: "0 0 0 3px var(--chakra-colors-backgroundDefault), 0 0 12px var(--chakra-colors-iconAccent)",
            }}
        />
    </Box>
);

export const SearchBar = ({ scene, submitHovered }: { scene: DocumentSceneState; submitHovered: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={DEMO_SPRING}
        style={{ position: "absolute", top: 8, left: 8, right: 8, zIndex: 3 }}
    >
        <DemoCard
            active={scene.searchFocused}
            h="30px"
            pl={2.5}
            pr={1}
            display="flex"
            alignItems="center"
            borderRadius="8px"
        >
            <HStack w="100%" spacing={2}>
                <Icon as={Search} boxSize="12px" color="textMuted" />
                <Text data-demo="search" variant="body-2xs" flex={1} color={scene.search ? "textPrimary" : "textMuted"}>
                    {scene.search || (!scene.searchFocused && "Rechercher par le sens…")}
                    {scene.searchFocused && <DemoCaret />}
                </Text>
                <Box
                    data-demo="search-submit"
                    w="22px"
                    h="22px"
                    borderRadius="6px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={scene.search ? "iconAccent" : "surfaceSubtle"}
                    transform={submitHovered ? "scale(1.1)" : "scale(1)"}
                    transition="all 0.25s ease"
                >
                    <Icon as={ArrowRight} boxSize="12px" color={scene.search ? "white" : "textMuted"} />
                </Box>
            </HStack>
        </DemoCard>
    </motion.div>
);
