import type { ReactNode } from "react";
import { Box, HStack, Icon, Text, type BoxProps } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { DemoState } from "hooks/demo/useDemoScript";
import { DemoCursor } from "components/ui/demo/DemoCursor";

export const DEMO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const DEMO_SPRING = {
    type: "spring",
    stiffness: 320,
    damping: 30,
} as const;

interface DemoStageProps {
    demo: DemoState;
    children: ReactNode;
}

export const DemoStage = ({ demo, children }: DemoStageProps) => (
    <Box ref={demo.stageRef} position="relative" w="100%" h="100%" overflow="hidden" userSelect="none">
        <motion.div
            initial={false}
            animate={{ opacity: demo.fading ? 0 : 1, scale: demo.fading ? 0.98 : 1 }}
            transition={{ duration: 0.45, ease: DEMO_EASE }}
            style={{ position: "absolute", inset: 0, padding: "44px 16px 18px" }}
        >
            <Box key={demo.iteration} h="100%">
                {children}
            </Box>
        </motion.div>
        <DemoCursor cursor={demo.cursor} />
        <ChapterBar chapter={demo.chapter} count={demo.chapterCount} />
    </Box>
);

const ChapterBar = ({ chapter, count }: { chapter: number; count: number }) => (
    <HStack position="absolute" bottom="8px" left={4} right={4} spacing="4px">
        {Array.from({ length: count }).map((_, i) => (
            <Box key={i} flex={1} h="3px" borderRadius="999px" bg="dotInactive" overflow="hidden">
                <motion.div
                    initial={false}
                    animate={{
                        scaleX: i <= chapter ? 1 : 0,
                        opacity: i === chapter ? 1 : 0.55,
                    }}
                    transition={{ duration: 0.6, ease: DEMO_EASE }}
                    style={{
                        height: "100%",
                        transformOrigin: "left",
                        background: "var(--chakra-colors-iconAccent)",
                    }}
                />
            </Box>
        ))}
    </HStack>
);

export const DemoChapterLabel = ({ icon, label }: { icon: LucideIcon; label: string }) => (
    <Box position="absolute" top="12px" left={4} zIndex={5}>
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={label}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: DEMO_EASE }}
            >
                <HStack
                    spacing={1.5}
                    px={2.5}
                    py={1}
                    bg="accentCardBg"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="borderAccentCardMuted"
                    borderRadius="999px"
                >
                    <Icon as={icon} boxSize="12px" color="iconAccent" />
                    <Text variant="body-2xs-semibold" color="textSecondary">
                        {label}
                    </Text>
                </HStack>
            </motion.div>
        </AnimatePresence>
    </Box>
);

export const DemoCard = ({ children, active, ...rest }: BoxProps & { active?: boolean }) => (
    <Box
        bg="surfaceAction"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={active ? "borderAccentCardActive" : "borderDivider"}
        borderRadius="12px"
        boxShadow={
            active ? "0 0 0 3px rgba(52,211,169,0.15), 0 6px 18px rgba(0,0,0,0.08)" : "0 1px 2px rgba(0,0,0,0.05)"
        }
        transition="border-color 0.3s ease, box-shadow 0.3s ease"
        {...rest}
    >
        {children}
    </Box>
);
