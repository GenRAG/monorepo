import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import borderRadius from "themeNew/foundations/borderRadius";
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

export const Menu = defineMultiStyleConfig({
    baseStyle,
    variants: {
        select,
    },
});
