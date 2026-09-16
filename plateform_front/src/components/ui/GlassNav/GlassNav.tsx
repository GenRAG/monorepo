import { ComponentType, useState } from "react";
import { Box, Flex, Text, Tooltip, chakra, useToken } from "@chakra-ui/react";
import { motion, Variants } from "framer-motion";
import { GlassSurface, GlassVariant } from "./GlassSurface";
import { AnimatedIconProps } from "./icons/types";
import { getGlassInk } from "./utils";

// Convention déjà utilisée dans le repo (WelcomeScreen.tsx, Drawer.tsx, AssistantInput.tsx) :
// on compose `motion()` autour d'un composant Chakra plutôt que l'inverse, pour garder les
// props de style Chakra (dont `transition`, un shorthand CSS) séparées des props d'animation
// framer-motion (`whileTap`, `variants`, `layoutId`...), qui elles passent en direct.
const MotionBox = motion(Box);
// Pour les boutons on part de `chakra(motion.button)` plutôt que `motion(Box) as="button"` :
// ça type nativement les attributs `<button>` (dont `type`) en plus des props Chakra/framer-motion.
const MotionButton = chakra(motion.button);

export interface GlassNavItem {
    id: string;
    label: string;
    icon: ComponentType<AnimatedIconProps>;
    /** Vertical uniquement : ancre l'item en bas de la pilule plutôt qu'avec le groupe du haut
     * (ex: Crédits séparé de la navigation principale). Ignoré en horizontal (bottom bar). */
    pinToEnd?: boolean;
}

export interface GlassNavAction {
    icon: ComponentType<AnimatedIconProps>;
    label: string;
    onClick: () => void;
}

export interface GlassNavProps {
    items: GlassNavItem[];
    /** Mode contrôlé : id de l'item actif. */
    value?: string;
    /** Mode non-contrôlé : id de l'item actif au premier rendu. */
    defaultValue?: string;
    onChange?: (id: string) => void;
    /** "vertical" = sidebar flottante. "horizontal" = bottom bar (icône + label). */
    orientation: "horizontal" | "vertical";
    /** Bouton rond détaché, avec sa propre GlassSurface (ex : accès rapide à l'assistant IA). */
    action?: GlassNavAction;
    variant?: GlassVariant;
    blur?: number;
    /** Marge entre la barre et le bord de l'écran (jamais 0 : le nav ne doit jamais toucher un bord). */
    offset?: number | string;
    /**
     * z-index du nav. `backdrop-filter` crée son propre contexte d'empilement (stacking context) :
     * la valeur par défaut (30) reste volontairement bien en dessous des z-index de modale/overlay
     * de Chakra (1300-1400 dans ce thème) pour qu'une modale passe toujours au-dessus du nav.
     */
    zIndex?: number;
}

const PILL_LAYOUT_ID = "glass-nav-active-pill";

export const GlassNav = ({
    items,
    value,
    defaultValue,
    onChange,
    orientation,
    action,
    variant = "dark",
    blur = 16,
    offset = 24,
    zIndex = 30,
}: GlassNavProps) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue ?? items[0]?.id);
    const activeId = isControlled ? value : internalValue;

    const handleSelect = (id: string) => {
        if (!isControlled) setInternalValue(id);
        onChange?.(id);
    };

    const isVertical = orientation === "vertical";
    const offsetPx = typeof offset === "number" ? `${offset}px` : offset;
    const isDark = variant === "dark";

    const { text: textColor, muted: mutedColor, pillBg } = getGlassInk(variant);

    const [green500, green400] = useToken("colors", ["green.500", "green.400"]);
    const activeIconColor = isDark ? green500 : green400;

    const topItems = isVertical ? items.filter((item) => !item.pinToEnd) : items;
    const endItems = isVertical ? items.filter((item) => item.pinToEnd) : [];

    const renderItem = (item: GlassNavItem) => (
        <NavItemButton
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            isVertical={isVertical}
            textColor={textColor}
            mutedColor={mutedColor}
            pillBg={pillBg}
            activeIconColor={activeIconColor}
            onSelect={() => handleSelect(item.id)}
        />
    );

    return (
        <Flex
            position="fixed"
            zIndex={zIndex}
            direction={isVertical ? "column" : "row"}
            align="center"
            gap={3}
            top={isVertical ? "50%" : undefined}
            left={isVertical ? offsetPx : "50%"}
            transform={isVertical ? "translateY(-50%)" : "translateX(-50%)"}
            bottom={isVertical ? undefined : `calc(${offsetPx} + env(safe-area-inset-bottom, 0px))`}
            pl={isVertical ? undefined : "env(safe-area-inset-left, 0px)"}
            pr={isVertical ? undefined : "env(safe-area-inset-right, 0px)"}
        >
            <GlassSurface
                variant={variant}
                blur={blur}
                borderRadius="full"
                p="4px"
                // En vertical, la pilule ne doit pas se réduire au nombre d'icônes (4-5 items ≈
                // 240px, ça se lit comme un petit badge flottant) : on lui donne une hauteur propre,
                // plafonnée pour ne jamais toucher le haut/bas de l'écran, pour qu'elle se lise comme
                // une vraie sidebar même quand `items` est court.
                h={isVertical ? "min(640px, calc(100vh - 64px))" : undefined}
            >
                {isVertical && endItems.length > 0 ? (
                    // Groupe du haut (navigation) et groupe ancré en bas (ex: Crédits), séparés par
                    // `justify="space-between"` plutôt que par un `mt="auto"` sur un seul item — ça
                    // reste correct même si `endItems` contient plusieurs entrées un jour.
                    <Flex direction="column" justify="space-between" align="center" h="100%">
                        <Flex direction="column" align="center" gap="10px">
                            {topItems.map(renderItem)}
                        </Flex>
                        <Flex direction="column" align="center" gap="10px">
                            {endItems.map(renderItem)}
                        </Flex>
                    </Flex>
                ) : (
                    <Flex
                        direction={isVertical ? "column" : "row"}
                        align="center"
                        justify={isVertical ? "center" : "flex-start"}
                        gap={isVertical ? "10px" : "2px"}
                        h={isVertical ? "100%" : undefined}
                    >
                        {items.map(renderItem)}
                    </Flex>
                )}
            </GlassSurface>

            {action && (
                <GlassSurface variant={variant} blur={blur} borderRadius="full" p={0}>
                    <ActionButton action={action} iconColor={activeIconColor} textColor={textColor} />
                </GlassSurface>
            )}
        </Flex>
    );
};

interface NavItemButtonProps {
    item: GlassNavItem;
    isActive: boolean;
    isVertical: boolean;
    textColor: string;
    mutedColor: string;
    pillBg: string;
    activeIconColor: string;
    onSelect: () => void;
}

// Bump d'échelle joué à l'entrée dans l'état actif — le badge n'existe que pour l'item actif
// (il est monté/démonté), donc `initial` sert de point de départ de cette petite pop-in.
const badgeVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 26 } },
};

const NavItemButton = ({
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

const ActionButton = ({
    action,
    iconColor,
    textColor,
}: {
    action: GlassNavAction;
    iconColor: string;
    textColor: string;
}) => {
    const Icon = action.icon;

    return (
        <MotionButton
            type="button"
            aria-label={action.label}
            onClick={action.onClick}
            whileTap={{ scale: 0.94 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="56px"
            h="56px"
            borderRadius="full"
            bg="transparent"
            color={textColor}
            cursor="pointer"
            border="none"
            outline="none"
            _hover={{ color: iconColor }}
            sx={{ transition: "color 0.2s ease" }}
            _focusVisible={{ boxShadow: "0 0 0 2px rgba(52, 211, 169, 0.85)" }}
        >
            <Icon size={24} isActive={false} />
        </MotionButton>
    );
};
