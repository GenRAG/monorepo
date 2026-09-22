import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

const BASE_STYLE: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
};

interface AnimationStepFrameProps {
    children: ReactNode;
    style?: CSSProperties;
}

/** Repeated fade-in/out wrapper for each step of a node's overview animation. */
export const AnimationStepFrame = ({ children, style }: AnimationStepFrameProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={style ? { ...BASE_STYLE, ...style } : BASE_STYLE}
    >
        {children}
    </motion.div>
);
