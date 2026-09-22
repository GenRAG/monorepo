import {
    FileWarning,
    Info,
    LeafIcon,
    Lightbulb,
    MessageCircleWarningIcon,
    MessageSquare,
    TriangleAlert,
    type LucideIcon,
} from "lucide-react";

import colors from "themeNew/foundations/colors";

export type BannerSizeKey = "xs" | "sm" | "md" | "lg";
export type BannerVariantKey = "gold" | "orange" | "blue" | "red" | "green" | "grey" | "olive" | "transparent" | "dark";

interface BannerSizeStyle {
    padding: string;
    iconBoxSize: string;
    iconSize: number;
    titleFontSize: string;
    childrenFontSize: string;
    spacing: string;
    badgeSize: string;
}

interface BannerVariantDarkOverrides {
    bg: string;
    borderColor: string;
    badgeBg: string;
    iconColor: string;
}

interface BannerVariantStyle {
    icon: LucideIcon;
    bg: string;
    borderColor: string;
    badgeBg: string;
    iconColor: string;
    glowColor: string;
    _active: { bg: string };
    _dark: BannerVariantDarkOverrides;
}

export const SizeBannerVariants: Record<BannerSizeKey, BannerSizeStyle> = {
    xs: {
        padding: "8px 10px",
        iconBoxSize: "32px",
        iconSize: 4,
        titleFontSize: "xs",
        childrenFontSize: "xs",
        spacing: "8px",
        badgeSize: "32px",
    },
    sm: {
        padding: "10px 12px",
        iconBoxSize: "36px",
        iconSize: 4,
        titleFontSize: "sm",
        childrenFontSize: "sm",
        spacing: "10px",
        badgeSize: "36px",
    },
    md: {
        padding: "12px 14px",
        iconBoxSize: "40px",
        iconSize: 5,
        titleFontSize: "sm",
        childrenFontSize: "sm",
        spacing: "12px",
        badgeSize: "40px",
    },
    lg: {
        padding: "16px 18px",
        iconBoxSize: "48px",
        iconSize: 6,
        titleFontSize: "md",
        childrenFontSize: "md",
        spacing: "14px",
        badgeSize: "48px",
    },
};

export const StyleBannerVariants: Record<BannerVariantKey, BannerVariantStyle> = {
    gold: {
        icon: Lightbulb,
        bg: "gold.50",
        borderColor: "gold.100",
        glowColor: colors.gold[100],
        iconColor: "gold.700",
        badgeBg: "gold.100",
        _active: { bg: "gold.50" },
        _dark: {
            bg: "gold.900",
            borderColor: "gold.800",
            badgeBg: "gold.800",
            iconColor: "gold.300",
        },
    },
    orange: {
        icon: FileWarning,
        bg: "orange.50",
        borderColor: "orange.100",
        badgeBg: "orange.100",
        iconColor: "orange.700",
        glowColor: colors.orange[100],
        _active: { bg: "orange.50" },
        _dark: {
            bg: "orange.900",
            borderColor: "orange.800",
            badgeBg: "orange.800",
            iconColor: "orange.300",
        },
    },
    blue: {
        icon: Info,
        bg: "blue.100",
        borderColor: "blue.200",
        badgeBg: "blue.200",
        iconColor: "blue.700",
        glowColor: colors.blue[100],
        _active: { bg: "blue.50" },
        _dark: {
            bg: "blue.900",
            borderColor: "blue.800",
            badgeBg: "blue.800",
            iconColor: "blue.300",
        },
    },
    red: {
        icon: TriangleAlert,
        bg: "red.50",
        borderColor: "red.100",
        badgeBg: "red.100",
        iconColor: "red.700",
        glowColor: colors.red[100],
        _active: { bg: "red.50" },
        _dark: {
            bg: "red.900",
            borderColor: "red.800",
            badgeBg: "red.800",
            iconColor: "red.300",
        },
    },
    green: {
        icon: Info,
        bg: "green.100",
        borderColor: "green.100",
        badgeBg: "green.200",
        iconColor: "green.700",
        glowColor: colors.green[100],
        _active: { bg: "green.50" },
        _dark: {
            bg: "green.900",
            borderColor: "green.800",
            badgeBg: "green.800",
            iconColor: "green.300",
        },
    },
    grey: {
        icon: MessageSquare,
        bg: "grey.50",
        borderColor: "grey.100",
        badgeBg: "grey.100",
        iconColor: "grey.700",
        glowColor: colors.grey[100],
        _active: { bg: "grey.50" },
        _dark: {
            bg: "grey.800",
            borderColor: "grey.700",
            badgeBg: "grey.700",
            iconColor: "grey.300",
        },
    },
    olive: {
        icon: LeafIcon,
        bg: "olive.50",
        borderColor: "olive.100",
        badgeBg: "olive.100",
        iconColor: "olive.700",
        glowColor: colors.olive[100],
        _active: { bg: "olive.50" },
        _dark: {
            bg: "olive.900",
            borderColor: "olive.800",
            badgeBg: "olive.800",
            iconColor: "olive.300",
        },
    },
    transparent: {
        icon: MessageCircleWarningIcon,
        bg: "transparent",
        borderColor: "transparent",
        badgeBg: "transparent",
        iconColor: "grey.700",
        glowColor: colors.grey[100],
        _active: { bg: "grey.50" },
        _dark: {
            bg: "transparent",
            borderColor: "transparent",
            badgeBg: "grey.800",
            iconColor: "grey.300",
        },
    },
    dark: {
        icon: Info,
        bg: "grey.900",
        borderColor: "grey.800",
        badgeBg: "grey.800",
        iconColor: "grey.300",
        glowColor: "rgba(255,255,255,0.05)",
        _active: { bg: "grey.800" },
        _dark: {
            bg: "grey.900",
            borderColor: "grey.800",
            badgeBg: "grey.700",
            iconColor: "grey.300",
        },
    },
};
