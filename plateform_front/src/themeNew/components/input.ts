import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import borderRadius from "themeNew/foundations/borderRadius";
import { textStyles } from "themeNew/foundations/typography";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const baseStyle = definePartsStyle({
    field: {
        ...textStyles?.["body-md"],
        bg: "inputBg",
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: borderRadius.sm,
        borderColor: "inputBorder",
        color: "inputText",
        _hover: {
            borderColor: "inputBorder",
        },
        _disabled: {
            bg: "inputDisabledBg",
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
            boxShadow: "0 0 0 1px var(--chakra-colors-green-400)",
        },
        "&:-webkit-autofill": {
            borderColor: "inputActiveBorder",
            WebkitTextFillColor: "var(--chakra-colors-inputText)",
            WebkitBoxShadow: "0 0 0px 1000px var(--chakra-colors-inputBg) inset",
            caretColor: "var(--chakra-colors-inputText)",
            transition: "background-color 5000s ease-in-out 0s",
        },
        "&:-webkit-autofill:hover": {
            borderColor: "inputActiveBorder",
            WebkitTextFillColor: "var(--chakra-colors-inputText)",
            WebkitBoxShadow: "0 0 0px 1000px var(--chakra-colors-inputBg) inset",
            caretColor: "var(--chakra-colors-inputText)",
            transition: "background-color 5000s ease-in-out 0s",
        },
        "&:-webkit-autofill:focus": {
            borderColor: "inputActiveBorder",
            WebkitTextFillColor: "var(--chakra-colors-inputText)",
            WebkitBoxShadow: "0 0 0px 1000px var(--chakra-colors-inputBg) inset",
            caretColor: "var(--chakra-colors-inputText)",
            transition: "background-color 5000s ease-in-out 0s",
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
