import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import borderRadius from "themeNew/foundations/borderRadius";
import { textStyles } from "themeNew/foundations/typography";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const baseStyle = definePartsStyle({
    field: {
        ...textStyles?.["body-md"],
        bg: "inputBg",
        borderRadius: borderRadius.sm,
        borderColor: "inputBorder",
        color: "inputText",
        _hover: {
            borderColor: "inputBorder",
        },
        _disabled: {
            bg: "inputBg",
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
        // Verre dépoli, aligné sur GlassSurface (components/ui/GlassNav) : fond translucide, flou,
        // bordure fine, sans ombre. Le rayon reste celui du thème par défaut. Le verre suit le colorMode (le ton de base vient de grey.975 / grey.100).
        glass: {
            field: {
                borderWidth: "1px",
                bg: "rgba(231, 231, 231, 0.62)",
                borderColor: "rgba(15, 23, 42, 0.16)",
                color: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(12px) saturate(200%)",
                WebkitBackdropFilter: "blur(12px) saturate(200%)",
                _placeholder: {
                    color: "rgba(15, 23, 42, 0.5)",
                },
                _hover: {
                    borderColor: "rgba(15, 23, 42, 0.28)",
                },
                _dark: {
                    bg: "rgba(11, 14, 17, 0.52)",
                    borderColor: "rgba(255, 255, 255, 0.14)",
                    color: "rgba(255, 255, 255, 0.95)",
                    _placeholder: {
                        color: "rgba(255, 255, 255, 0.55)",
                    },
                    _hover: {
                        borderColor: "rgba(255, 255, 255, 0.28)",
                    },
                },
                _focus: {
                    borderColor: "inputActiveBorder",
                    boxShadow: "none",
                },
                _focusVisible: {
                    borderColor: "inputActiveBorder",
                    boxShadow: "none",
                },
            },
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
