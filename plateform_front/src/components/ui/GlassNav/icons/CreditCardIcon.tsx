import { motion, type Transition } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { AnimatedSvg } from "./AnimatedSvg";

const FLIP: Transition = { duration: 0.55, times: [0, 0.5, 1], ease: "easeInOut" };

// Hover: the card flips over: the chip side turns into the magnetic-stripe side halfway through.
export const CreditCardIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers}>
            <motion.g
                style={{ transformOrigin: "12px 12px" }}
                variants={{
                    initial: { scaleX: 1 },
                    hover: { scaleX: [1, 0.05, 1], transition: FLIP },
                    active: { scaleX: 1 },
                }}
                initial="initial"
                animate={label}
            >
                <rect x={2} y={5} width={20} height={14} rx={3} fill="currentColor" />
                {/* Front: chip */}
                <motion.rect
                    x={5}
                    y={9}
                    width={7}
                    height={3}
                    rx={1}
                    fill="currentColor"
                    variants={{
                        initial: { opacity: 0.4 },
                        hover: { opacity: [0.4, 0, 0], transition: FLIP },
                        active: { opacity: 0.4 },
                    }}
                    initial="initial"
                    animate={label}
                />
                {/* Back: magnetic stripe */}
                <motion.rect
                    x={2}
                    y={8}
                    width={20}
                    height={3.2}
                    fill="black"
                    variants={{
                        initial: { opacity: 0 },
                        hover: { opacity: [0, 0, 0.45], transition: FLIP },
                        active: { opacity: 0 },
                    }}
                    initial="initial"
                    animate={label}
                />
            </motion.g>
        </AnimatedSvg>
    );
};
