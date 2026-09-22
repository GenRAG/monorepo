import { type ComponentType, useId } from "react";
import { Box, chakra, Text, Tooltip, useColorModeValue, useToken } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { GlassSurface, getGlassInk } from "components/ui/GlassNav";

const MotionBox = motion(Box);
const MotionButton = chakra(motion.button);

interface GlassTab<T extends string> {
    value: T;
    label: string;
    icon?: ComponentType<{ size?: number }>;
}

interface GlassTabBarProps<T extends string> {
    tabs: GlassTab<T>[];
    activeTab: T;
    onChange: (tab: T) => void;
}

/**
 * Tab switcher de page en pilule "verre" — même matériau que la bottom bar de `GlassNav`, mais
 * toujours horizontal ("permanent" : pas de bascule vers une sidebar verticale comme le fait
 * GlassNav en desktop) et flottant au-dessus du contenu de LA PAGE plutôt que de l'écran entier.
 *
 * Seul l'onglet actif affiche son libellé (icône + texte, côte à côte) ; les autres restent en
 * icône seule — avec plusieurs libellés parfois longs ("Contrôle d'accès"), les afficher tous en
 * permanence gonflait la pilule bien au-delà de ce qu'un simple switcher de page justifie.
 *
 * `position: absolute` (pas `fixed`) : le centrage suit la largeur du conteneur positionné le plus
 * proche (la page appelante, via `position: relative`), déjà décalée par la sidebar agent — un
 * `fixed` + `left: 50%` se centrerait sur le viewport entier et paraîtrait décalé par rapport au
 * contenu réel de la page.
 *
 * `layoutId` unique par instance (via `useId()`) plutôt qu'une constante partagée comme le
 * `PILL_LAYOUT_ID` de GlassNav : cette barre peut coexister à l'écran avec la vraie nav app-wide
 * (mode bottom bar mobile), et deux éléments animés avec le même `layoutId` se feraient concurrence
 * dans la transition de layout de framer-motion.
 */
export const GlassTabBar = <T extends string = string>({ tabs, activeTab, onChange }: GlassTabBarProps<T>) => {
    const instanceId = useId();
    const variant = useColorModeValue("light", "dark");
    const { text: textColor, muted: mutedColor, pillBg } = getGlassInk(variant);
    const [green500, green400] = useToken("colors", ["green.500", "green.400"]);
    const activeIconColor = variant === "dark" ? green500 : green400;

    return (
        <Box
            position="absolute"
            bottom={{ base: 4, md: 6 }}
            left="50%"
            transform="translateX(-50%)"
            zIndex={2}
            pointerEvents="none"
        >
            <GlassSurface variant={variant} borderRadius="full" p="3px" pointerEvents="auto">
                <Box display="flex" alignItems="center" gap="2px">
                    {tabs.map(({ value, label, icon: Icon }) => {
                        const isActive = activeTab === value;
                        const button = (
                            <MotionButton
                                key={value}
                                type="button"
                                aria-label={label}
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => onChange(value)}
                                whileTap={{ scale: 0.94 }}
                                position="relative"
                                display="flex"
                                flexDirection="row"
                                alignItems="center"
                                justifyContent="center"
                                gap={isActive ? "6px" : 0}
                                px={isActive ? "12px" : "9px"}
                                h="32px"
                                flexShrink={0}
                                borderRadius="full"
                                cursor="pointer"
                                border="none"
                                bg="transparent"
                                outline="none"
                                transition="padding 0.15s ease"
                                _focusVisible={{ boxShadow: "0 0 0 2px rgba(52, 211, 169, 0.85)" }}
                            >
                                {isActive && (
                                    <MotionBox
                                        layoutId={`glass-tab-bar-pill-${instanceId}`}
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                        position="absolute"
                                        inset={0}
                                        bg={pillBg}
                                        borderRadius="full"
                                        zIndex={-1}
                                    />
                                )}
                                {Icon && (
                                    <Box color={isActive ? activeIconColor : mutedColor} display="flex">
                                        <Icon size={16} />
                                    </Box>
                                )}
                                {isActive && (
                                    <Text
                                        as="span"
                                        fontSize="12px"
                                        fontWeight={600}
                                        lineHeight={1}
                                        color={textColor}
                                        userSelect="none"
                                        whiteSpace="nowrap"
                                    >
                                        {label}
                                    </Text>
                                )}
                            </MotionButton>
                        );

                        return isActive ? (
                            button
                        ) : (
                            <Tooltip
                                key={value}
                                placement="top"
                                color="white"
                                borderRadius="8px"
                                hasArrow
                                bg="tooltipBg"
                                label={label}
                            >
                                {button}
                            </Tooltip>
                        );
                    })}
                </Box>
            </GlassSurface>
        </Box>
    );
};
