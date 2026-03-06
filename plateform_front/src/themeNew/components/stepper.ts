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
            "&[data-status=complete]": {
                bg: colors.primary900,
            },
            "&[data-status=incomplete]": {
                bg: "gray.300",
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
