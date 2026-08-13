import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";
import { textStyles } from "themeNew/foundations/typography";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tableAnatomy.keys);

// https://v2.chakra-ui.com/docs/components/table/theming

const simple = definePartsStyle({
    tr: {
        borderColor: "transparent",
        _last: {
            borderBottom: "none",
        },
    },
    th: {
        px: 4,
        borderColor: "transparent",
        "&[data-is-numeric=true]": {
            textAlign: "end",
        },
    },
    td: {
        px: 4,
        borderColor: "transparent",
        "&[data-is-numeric=true]": {
            textAlign: "end",
        },
    },
    thead: {
        th: {
            px: 4,
            py: 2,
            ...textStyles["caption-lg"],
            letterSpacing: "0px",
            textTransform: "none",
            fontSize: "10px",
            _dark: {
                borderColor: "grey.800",
                color: "grey.300",
            },
            _light: {
                borderColor: "grey.100",
                color: "grey.900",
            },
        },
    },
    tbody: {
        tr: {
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
        },
    },
});

export const tableTheme = defineMultiStyleConfig({
    variants: { simple },
});
