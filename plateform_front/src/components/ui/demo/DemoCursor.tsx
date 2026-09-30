import { Box } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { DemoState } from "hooks/demo/useDemoScript";

export const DemoCursor = ({ cursor }: { cursor: DemoState["cursor"] }) => {
    if (cursor.hidden) return null;

    return (
        <motion.div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                x: cursor.x,
                y: cursor.y,
                opacity: cursor.opacity,
                zIndex: 50,
                pointerEvents: "none",
            }}
        >
            <AnimatePresence>
                <motion.div
                    key={cursor.clicks}
                    initial={{ scale: 0, opacity: cursor.clicks ? 0.55 : 0 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.2, 0.8, 0.3, 1] }}
                    style={{
                        position: "absolute",
                        width: 34,
                        height: 34,
                        left: -17,
                        top: -17,
                        borderRadius: "999px",
                        background: "var(--chakra-colors-green-400)",
                    }}
                />
            </AnimatePresence>

            <AnimatePresence>
                {cursor.carry && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                        animate={{ opacity: 1, scale: 1, rotate: -4 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}
                        style={{ position: "absolute", left: 10, top: 14 }}
                    >
                        {cursor.carry}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                animate={{ scale: cursor.pressed ? 0.82 : 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 28 }}
                style={{
                    transformOrigin: "2px 2px",
                    position: "relative",
                    left: -2,
                    top: -2,
                }}
            >
                <Box
                    as="svg"
                    width="20px"
                    height="22px"
                    viewBox="0 0 20 22"
                    filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"
                >
                    <path
                        d="M2 1.5L2 17.2L6.1 13.4L8.9 19.8L11.9 18.5L9.2 12.3L14.8 12.1Z"
                        fill="white"
                        stroke="var(--chakra-colors-grey-950)"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                    />
                </Box>
            </motion.div>
        </motion.div>
    );
};
