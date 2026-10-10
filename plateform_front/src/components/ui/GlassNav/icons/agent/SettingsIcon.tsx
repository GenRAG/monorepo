import { motion } from "framer-motion";
import { AnimatedIconProps } from "../types";
import { useIconAnimationState } from "../useIconAnimationState";
import { AnimatedSvg } from "../AnimatedSvg";

const GEAR =
    "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z";

// Settings: the gear advances notch by notch like a ratchet (move, small kick back, move) while the hub counter-turns.
export const SettingsIcon = ({ size = 18, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers} stroked>
            <motion.path
                d={GEAR}
                style={{ transformOrigin: "12px 12px" }}
                variants={{
                    initial: { rotate: 0 },
                    hover: {
                        rotate: [0, 34, 28, 64, 58, 90],
                        transition: { duration: 0.9, times: [0, 0.2, 0.3, 0.55, 0.65, 1], ease: "easeOut" },
                    },
                    active: { rotate: 0 },
                }}
                initial="initial"
                animate={label}
            />
            <motion.circle
                cx={12}
                cy={12}
                r={3}
                style={{ transformOrigin: "12px 12px" }}
                variants={{
                    initial: { scale: 1 },
                    hover: { scale: [1, 0.6, 1], transition: { duration: 0.9, ease: "easeInOut" } },
                    active: { scale: 1 },
                }}
                initial="initial"
                animate={label}
            />
        </AnimatedSvg>
    );
};
