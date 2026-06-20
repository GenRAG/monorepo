import { extendTheme } from "@chakra-ui/react";
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react";
import { darkThemeColors } from "../foundations/themeConfig";

const parts = [
    "stepper",
    "step",
    "title",
    "description",
    "indicator",
    "separator",
    "icon",
    "number",
];

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(parts);

const createVariant = (colorName: "orange" | "green" | "blue") => {
    const colors = darkThemeColors[colorName];
    return definePartsStyle({
        indicator: {
            "&[data-status=complete]": {
                bg: colors.primary500,
                borderColor: colors.primary900,
            },
            "&[data-status=active]": {
                bg: colors.primary500,
                borderColor: colors.primary900,
                color: colors.primary500,
            },
            "&[data-status=incomplete]": {
                bg: "white",
                borderColor: "gray.300",
            },
        },
        separator: {
            // Solid green line for completed steps
            "&[data-status=complete]": {
                bg: colors.rgba.primary,
            },
            // Dashed line via repeating gradient for active/incomplete steps
            "&[data-status=incomplete], &[data-status=active]": {
                bg: "transparent",
                backgroundImage: `repeating-linear-gradient(to bottom, ${colors.rgba.primary30} 0, ${colors.rgba.primary30} 5px, transparent 5px, transparent 11px)`,
            },
        },
    });
};

const Stepper = defineMultiStyleConfig({
    variants: {
        orange: createVariant("orange"),
        green: createVariant("green"),
        blue: createVariant("blue"),
    },
});

export default Stepper;
