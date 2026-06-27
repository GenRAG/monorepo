import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import colors from "themeNew/foundations/colors";
import { headingStyles } from "themeNew/foundations/typography";

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(modalAnatomy.keys);

const spacingValues = {
    xs: {
        px: "12px",
        py: "12px",
    },
    sm: {
        px: "16px",
        py: "16px",
    },
    md: {
        px: "24px",
        py: "16px",
    },
    lg: {
        px: "28px",
        py: "16px",
    },
    xl: {
        px: "32px",
        py: "16px",
    },
    "2xl": {
        px: "32px",
        py: "16px",
    },
    "3xl": {
        px: "32px",
        py: "16px",
    },
    full: {
        px: "24px",
        py: "16px",
    },
};

const widthValues = {
    xs: {
        maxWidth: "400px",
    },
    sm: {
        maxWidth: "480px",
    },
    md: {
        maxWidth: "600px",
    },
    lg: {
        maxWidth: "720px",
    },
    xl: {
        maxWidth: "840px",
    },
    "2xl": {
        maxWidth: "960px",
    },
    "3xl": {
        maxWidth: "1080px",
    },
};

const getSectionsResponsive = (size: string) => ({
    dialog: {
        ...widthValues[size as keyof typeof widthValues],
        bg: {
            default: colors.whites.offwhite,
            _dark: colors.grey[800],
        },
    },
    closeButton: {
        top: spacingValues[size as keyof typeof spacingValues].py,
        right: spacingValues[size as keyof typeof spacingValues].px,
    },
    header: {
        ...spacingValues[size as keyof typeof spacingValues],
        // In case of a title with a close button, we need to subtract the close button width (16px)
        maxW: `calc(100% - ${spacingValues[size as keyof typeof spacingValues].px} - ${
            spacingValues[size as keyof typeof spacingValues].px
        } - 16px)`,
        ...headingStyles["heading-sm"],
        lineHeight: "32px", // Line height is 32px to match the height of the close button
    },
    body: {
        ...spacingValues[size as keyof typeof spacingValues],
    },
    footer: {
        ...spacingValues[size as keyof typeof spacingValues],
    },
});

const Modal = defineMultiStyleConfig({
    sizes: {
        xs: getSectionsResponsive("xs"),
        sm: getSectionsResponsive("sm"),
        md: getSectionsResponsive("md"),
        lg: getSectionsResponsive("lg"),
        xl: getSectionsResponsive("xl"),
        "2xl": getSectionsResponsive("2xl"),
        "3xl": getSectionsResponsive("3xl"),
        full: getSectionsResponsive("full"),
    },
    baseStyle: {
        dialog: {
            bg: {
                default: colors.whites.white,
                _dark: colors.grey[800],
            },
            borderRadius: "8px",
        },
        closeButton: {
            _focusVisible: {
                boxShadow: "hidden",
            },
            fontSize: "10px",
            border: "1px solid #E7E7E7",
            borderRadius: "4px",
        },
    },
    defaultProps: {
        size: "md",
    },
});

export default Modal;
