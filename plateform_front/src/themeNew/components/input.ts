import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import borderRadius from "themeNew/foundations/borderRadius";
import colors from "themeNew/foundations/colors";
import { textStyles } from "themeNew/foundations/typography";

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(inputAnatomy.keys);

const baseStyle = definePartsStyle({
    field: {
        ...textStyles?.["body-md"],
        bg: "inputBg",
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: borderRadius.xs,
        borderColor: "inputBorder",
        color: "inputText",
        _hover: {
            borderColor: "inputBorder",
        },
        _disabled: {
            bg: colors.grey[50],
            color: "inputPlaceholder",
        },
        _placeholder: {
            color: "inputPlaceholder",
        },
        _active: {
            borderColor: "inputActiveBorder",
        },
        _focus: {
            borderColor: "inputActiveBorder",
        },
    },
});

const Input = defineMultiStyleConfig({
    baseStyle,
    variants: {
        default: {
            ...baseStyle,
        },
    },
    sizes: {
        lg: {
            field: {
                height: "56px",
            },
        },
        md: {
            field: {
                height: "48px",
            },
        },
        sm: {
            field: {
                height: "40px",
            },
        },
        xs: {
            field: {
                height: "32px",
            },
        },
    },
    defaultProps: {
        size: "md",
        variant: "default",
    },
});

export default Input;
