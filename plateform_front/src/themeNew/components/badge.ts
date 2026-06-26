import { textStyles } from "themeNew/foundations/typography";

export type BadgeProps = {
    colorScheme: "gold" | "white" | "green" | "olive" | "red" | "transparent" | "grey" | "blue" | "lightGold";
    size: "lg" | "md" | "sm" | "xs" | "2xs";
};

import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";

const getColorScheme = (colorScheme: BadgeProps["colorScheme"], props: StyleFunctionProps) => {
    const badgeColors = {
        gold: {
            bg: mode("gold.200", "gold.400")(props),
            color: mode("font.primary", "grey.950")(props),
        },
        mediumGold: {
            bg: mode("gold.100", "gold.300")(props),
            color: mode("grey.950", "grey.100")(props),
        },
        lightGold: {
            bg: mode("gold.50", "gold.200")(props),
            color: mode("grey.950", "grey.100")(props),
        },
        orange: {
            bg: mode("orange.200", "orange.700")(props),
            color: mode("grey.950", "orange.500")(props),
        },
        green: {
            bg: mode("green.50", "green.700")(props),
            color: mode("green.600", "green.100")(props),
        },
        olive: {
            bg: mode("olive.50", "olive.800")(props),
            color: mode("olive.600", "olive.50")(props),
        },
        red: {
            bg: mode("red.50", "red.700")(props),
            color: mode("red.600", "red.100")(props),
        },
        grey: {
            bg: mode("grey.50", "grey.800")(props),
            color: mode("font.primary", "grey.50")(props),
        },
        blue: {
            bg: mode("blue.50", "blue.800")(props),
            color: mode("blue.900", "blue.100")(props),
        },
        white: {
            bg: mode("whites.white", "grey.900")(props),
            color: mode("font.primary", "grey.50")(props),
        },
        transparent: {
            bg: "transparent",
            color: mode("font.primary", "grey.50")(props),
        },
        semiTransparent: {
            bg: mode("whites.lightwhite", "grey.900")(props),
            color: mode("font.primary", "grey.50")(props),
        },
    };
    return badgeColors[colorScheme];
};

const Badge = {
    sizes: {
        lg: {
            padding: "12px 16px",
            ...textStyles["caption-md"],
        },
        md: {
            padding: "6px 12px",
            ...textStyles["caption-sm"],
        },
        sm: {
            padding: "4px 8px",
            ...textStyles["caption-sm"],
        },
        xs: {
            padding: "4px 8px",
            ...textStyles["caption-xs"],
        },
        "2xs": {
            padding: "2px 4px",
            ...textStyles["caption-xs"],
        },
    },

    variants: {
        base: (props: BadgeProps) => ({
            borderRadius: "4px",
            borderWidth: "0px",
            ...getColorScheme(props.colorScheme ?? "gold", props as any),
        }),

        numberRounded: (props: BadgeProps) => ({
            borderRadius: "full",
            padding: "0px 8px",
            ...textStyles["body-sm-semibold"],
            textTransform: "uppercase",
            ...getColorScheme(props.colorScheme ?? "gold", props as any),
        }),
    },

    defaultProps: {
        variant: "base",
        size: "md",
        colorScheme: "gold",
    },
};

export default Badge;
