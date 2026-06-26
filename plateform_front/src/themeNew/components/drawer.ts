import { drawerAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import colors from "themeNew/foundations/colors";

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(drawerAnatomy.keys);

const Drawer = defineMultiStyleConfig({
    baseStyle: {
        header: {
            bg: {
                default: colors.whites.offwhite,
            },
        },
        body: {
            pb: "80px",
            bg: {
                default: colors.whites.offwhite,
            },
        },
        dialog: {
            borderRadius: {
                base: "16px 16px 0px 0px",
                xl: "12px 0px 0px 12px",
            },
        },
        closeButton: {
            bg: colors.whites.white,
            borderWidth: "1px",
            borderColor: colors.grey[100],
            borderRadius: "4px",
            _focus: {
                borderColor: "transparent",
            },
            top: "16px",
            right: "16px",
        },
        footer: {
            bg: colors.whites.offwhite,
            borderTop: "1px solid",
            borderColor: colors.grey[50],
        },
    },

    sizes: {
        lg: {
            header: {
                px: "16px",
                pt: "16px",
            },
            body: {
                px: "16px",
            },
            footer: {
                px: "16px",
                pb: "16px",
            },
        },
    },
});

export default Drawer;
