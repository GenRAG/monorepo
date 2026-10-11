import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import borderRadius from "themeNew/foundations/borderRadius";
import { GLASS_BG, GLASS_BORDER, GLASS_BORDER_HOVER, GLASS_INK } from "themeNew/foundations/glass";
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
                bg: GLASS_BG.light,
                borderColor: GLASS_BORDER.light,
                color: GLASS_INK.light.text,
                backdropFilter: "blur(12px) saturate(200%)",
                WebkitBackdropFilter: "blur(12px) saturate(200%)",
                _placeholder: {
                    color: GLASS_INK.light.muted,
                },
                _hover: {
                    borderColor: GLASS_BORDER_HOVER.light,
                },
                _dark: {
                    bg: GLASS_BG.dark,
                    borderColor: GLASS_BORDER.dark,
                    color: GLASS_INK.dark.text,
                    _placeholder: {
                        color: GLASS_INK.dark.muted,
                    },
                    _hover: {
                        borderColor: GLASS_BORDER_HOVER.dark,
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
