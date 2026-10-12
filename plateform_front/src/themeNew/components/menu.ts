import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import borderRadius from "themeNew/foundations/borderRadius";
import {
    GLASS_BG,
    GLASS_BORDER,
    GLASS_BORDER_HOVER,
    GLASS_FOCUS_RING,
    GLASS_INK,
    type GlassTone,
} from "themeNew/foundations/glass";
import { textStyles } from "themeNew/foundations/typography";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
    list: {
        borderRadius: "8px",
        boxShadow: "xl",
        borderColor: "white",
        _dark: {
            borderColor: "grey.800",
        },
    },
    item: {
        ...textStyles["body-sm-semibold"],
        color: "font.primary",
        bg: {
            default: "white",
            _dark: "grey.900",
        },

        _hover: {
            bg: "grey.50",
        },
        _focus: {
            bg: "grey.50",
        },

        _dark: {
            _hover: {
                bg: "grey.700",
            },
            _focus: {
                bg: "grey.700",
            },
        },
    },
});

const select = definePartsStyle({
    item: {
        ...textStyles["body-md"],
        p: "12px",
    },
    list: {
        borderRadius: borderRadius.xs,
        py: "0px",
    },
});

const glassSurface = (tone: GlassTone) => ({
    bg: GLASS_BG[tone],
    borderColor: GLASS_BORDER[tone],
    color: GLASS_INK[tone].text,
});

const glassPill = (tone: GlassTone) => ({
    bg: GLASS_INK[tone].pillBg,
});

// Même verre que l'input `glass` (barre de recherche des documents) pour que les filtres forment une seule barre.
const glass = definePartsStyle({
    button: {
        ...textStyles["body-sm-semibold"],
        h: "40px",
        px: "12px",
        borderWidth: "1px",
        borderRadius: borderRadius.sm,
        backdropFilter: "blur(12px) saturate(200%)",
        transition: "border-color 0.15s, background 0.15s",
        ...glassSurface("light"),
        _hover: { borderColor: GLASS_BORDER_HOVER.light },
        _expanded: { borderColor: "inputActiveBorder" },
        _focusVisible: { outline: "none", boxShadow: GLASS_FOCUS_RING },
        _disabled: { opacity: 0.5, cursor: "not-allowed" },
        _dark: {
            ...glassSurface("dark"),
            _hover: { borderColor: GLASS_BORDER_HOVER.dark },
            _expanded: { borderColor: "inputActiveBorder" },
        },
    },
    list: {
        p: "4px",
        minW: "220px",
        borderWidth: "1px",
        borderRadius: borderRadius.md,
        backdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
        ...glassSurface("light"),
        _dark: {
            ...glassSurface("dark"),
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
        },
    },
    item: {
        ...textStyles["body-sm"],
        px: "10px",
        py: "8px",
        borderRadius: "6px",
        bg: "transparent",
        color: "inherit",
        _hover: glassPill("light"),
        _focus: glassPill("light"),
        _dark: {
            bg: "transparent",
            _hover: glassPill("dark"),
            _focus: glassPill("dark"),
        },
    },
    icon: {
        color: "green.400",
    },
    groupTitle: {
        ...textStyles["body-xs-semibold"],
        mx: "10px",
        my: "6px",
        color: GLASS_INK.light.muted,
        _dark: { color: GLASS_INK.dark.muted },
    },
    divider: {
        my: "4px",
        borderColor: GLASS_BORDER.light,
        _dark: { borderColor: GLASS_BORDER.dark },
    },
});

export const Menu = defineMultiStyleConfig({
    baseStyle,
    variants: {
        select,
        glass,
    },
});
