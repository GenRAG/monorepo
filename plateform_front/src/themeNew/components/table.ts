import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";
import { textStyles } from "themeNew/foundations/typography";

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(tableAnatomy.keys);

// https://v2.chakra-ui.com/docs/components/table/theming

const simple = definePartsStyle({
    tr: {
        //borderBottom: "1px solid",
        borderColor: "transparent",
        _last: {
            borderBottom: "none",
        },
    },
    th: {
        px: 4,
        borderColor: "transparent",
        //borderBottom: "1px solid",
        "&[data-is-numeric=true]": {
            textAlign: "end",
        },
    },
    td: {
        px: 4,
        borderColor: "transparent",
        //borderBottom: "1px solid",
        "&[data-is-numeric=true]": {
            textAlign: "end",
        },
    },
    thead: {
        th: {
            px: 4,
            ...textStyles["caption-lg"],
            letterSpacing: "0px",
            textTransform: "none",
            _dark: {
                borderColor: "grey.500",
                color: "grey.100",
            },
            _light: {
                borderColor: "grey.100",
                color: "grey.900",
            },
            //borderBottom: "2px solid",
        },
    },
    tbody: {
        tr: {
            //borderBottom: "1px solid",
            borderBottomColor: "transparent",
            _last: {
                borderBottom: "none",
            },
        },
        td: {
            ...textStyles["body-sm"],
            color: "font.primary",
            letterSpacing: "0px",
            px: 4,
            py: 3,
            borderColor: "transparent",
            //borderBottom: "1px solid",
        },
    },
});

export const tableTheme = defineMultiStyleConfig({
    variants: { simple },
});
