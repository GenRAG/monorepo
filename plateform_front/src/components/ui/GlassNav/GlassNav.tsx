import { ComponentType, useState } from "react";
import { Flex, useToken } from "@chakra-ui/react";
import { GlassSurface, GlassVariant } from "./GlassSurface";
import { AnimatedIconProps } from "./icons/types";
import { getGlassInk } from "./utils";
import { NavItemButton } from "./GlassNavItemButton";

export interface GlassNavItem {
    id: string;
    label: string;
    icon: ComponentType<AnimatedIconProps>;
    /** Vertical uniquement : ancre l'item en bas de la pilule plutôt qu'avec le groupe du haut
     * (ex: Crédits séparé de la navigation principale). Ignoré en horizontal (bottom bar). */
    pinToEnd?: boolean;
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

export const GlassNav = ({
    items,
    value,
    defaultValue,
    onChange,
    orientation,
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
        </Flex>
    );
};
