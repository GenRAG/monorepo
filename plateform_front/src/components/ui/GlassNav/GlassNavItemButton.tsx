import { Box, Text, Tooltip, chakra } from "@chakra-ui/react";
import { motion, Variants } from "framer-motion";
import { GlassNavItem } from "./GlassNav";

const MotionBox = motion(Box);
const MotionButton = chakra(motion.button);

export interface NavItemButtonProps {
    item: GlassNavItem;
    isActive: boolean;
    isVertical: boolean;
    textColor: string;
    mutedColor: string;
    pillBg: string;
    activeIconColor: string;
    onSelect: () => void;
}

export const PILL_LAYOUT_ID = "glass-nav-active-pill";

// Bump d'échelle joué à l'entrée dans l'état actif — le badge n'existe que pour l'item actif
// (il est monté/démonté), donc `initial` sert de point de départ de cette petite pop-in.
const badgeVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 26 } },
};

export const NavItemButton = ({
    item,
    isActive,
    isVertical,
    textColor,
    mutedColor,
    pillBg,
    activeIconColor,
    onSelect,
}: NavItemButtonProps) => {
    const Icon = item.icon;
    const badgeSize = isVertical ? "22px" : "20px";

    const iconNode = isActive ? (
        <MotionBox
            initial="initial"
            animate="animate"
            variants={badgeVariants}
            w={badgeSize}
            h={badgeSize}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={activeIconColor}
        >
            <Icon size={isVertical ? 22 : 20} isActive />
        </MotionBox>
    ) : (
        <Box display="flex" alignItems="center" justifyContent="center" color={mutedColor}>
            <Icon size={isVertical ? 22 : 20} isActive={false} />
        </Box>
    );

    const button = (
        <MotionButton
            type="button"
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            onClick={onSelect}
            whileTap={{ scale: 0.94 }}
            position="relative"
            display="flex"
            flexDirection={isVertical ? "row" : "column"}
            alignItems="center"
            justifyContent="center"
            gap={isVertical ? 0 : "6px"}
            px={isVertical ? 0 : "2px"}
            py={isVertical ? 0 : "4px"}
            w={isVertical ? "56px" : "84px"}
            h={isVertical ? "56px" : "auto"}
            flexShrink={0}
            borderRadius="full"
            cursor="pointer"
            border="none"
            bg="transparent"
            outline="none"
            _focusVisible={{ boxShadow: "0 0 0 2px rgba(52, 211, 169, 0.85)" }}
        >
            {isActive && (
                <MotionBox
                    layoutId={PILL_LAYOUT_ID}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    position="absolute"
                    inset={0}
                    bg={pillBg}
                    borderRadius="full"
                    zIndex={-1}
                />
            )}
            {iconNode}
            {!isVertical && (
                <Text
                    as="span"
                    fontSize="12px"
                    fontWeight={isActive ? 600 : 500}
                    lineHeight={1}
                    color={isActive ? textColor : mutedColor}
                    userSelect="none"
                    maxW="100%"
                    isTruncated
                    sx={{ transition: "color 0.2s ease" }}
                >
                    {item.label}
                </Text>
            )}
        </MotionButton>
    );

    if (isVertical) {
        return (
            <Tooltip placement="right" color="white" borderRadius="8px" hasArrow bg="tooltipBg" label={item.label}>
                {button}
            </Tooltip>
        );
    }

    return button;
};
