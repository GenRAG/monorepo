import { StyleFunctionProps } from "@chakra-ui/styled-system";

import borderRadius from "themeNew/foundations/borderRadius";
import colors from "themeNew/foundations/colors";
import { shadow } from "themeNew/foundations/shadow";
import { darkThemeColors } from "themeNew/foundations/themeConfig";
import { textStyles } from "themeNew/foundations/typography";

const Button = {
    baseStyle: {
        borderRadius: borderRadius.xs,
        _disabled: {
            opacity: "1",
        },
    },

    sizes: {
        xl: {
            paddingX: "32px",
            paddingY: "16px",
            ...textStyles["body-md-semibold"],
        },
        lg: {
            paddingX: "24px",
            paddingY: "12px",
            ...textStyles["body-sm-semibold"],
        },
        md: {
            paddingX: "16px",
            paddingY: "8px",
            ...textStyles["body-sm-semibold"],
        },
        sm: {
            paddingX: "12px",
            paddingY: "8px",
            ...textStyles["body-xs-semibold"],
        },
        xs: {
            paddingX: "8px",
            paddingY: "4px",
            ...textStyles["body-2xs-semibold"],
        },
    },

    variants: {
        superPrimary: (props: StyleFunctionProps) => {
            const disabled =
                props.isDisabled || props.disabled || props.isLoading;

            return {
                color: disabled ? colors.grey[300] : colors.whites.white,
                cursor: disabled ? "not-allowed" : "pointer",

                background: disabled
                    ? "linear-gradient(130deg, rgba(209, 209, 209, 0.9) 0%, rgba(176, 176, 176, 0.9) 100%)"
                    : "radial-gradient(120% 120% at 100% 0%, rgba(110, 231, 199, 0.4) 0%, rgba(110, 231, 199, 0) 48%), linear-gradient(130deg, #12B98C 0%, #07966F 55%, #047859 100%)",
                border: disabled
                    ? "1px solid rgba(209, 209, 209, 0.95)"
                    : "1px solid rgba(168, 243, 223, 0.7)",
                boxShadow: disabled
                    ? "none"
                    : "0 6px 20px rgba(7, 150, 111, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                backgroundSize: "180% 180%",
                backgroundPosition: "0% 50%",
                transition: disabled
                    ? "none"
                    : "background-position 0.45s ease, transform 0.2s ease, box-shadow 0.2s ease",

                _hover: disabled
                    ? {}
                    : {
                          backgroundPosition: "100% 50%",
                          transform: "translateY(-1px)",
                          boxShadow:
                              "0 10px 24px rgba(7, 150, 111, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
                      },

                _active: disabled
                    ? {}
                    : {
                          transform: "translateY(0)",
                          background:
                              "radial-gradient(120% 120% at 100% 0%, rgba(52, 211, 169, 0.28) 0%, rgba(52, 211, 169, 0) 48%), linear-gradient(130deg, #07966F 0%, #076048 100%)",
                          boxShadow:
                              "0 4px 12px rgba(7, 150, 111, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
                      },

                _focus: {
                    boxShadow: disabled ? "none" : shadow["focus-button"],
                },
            };
        },
        superSecondary: (props: StyleFunctionProps) => {
            const disabled =
                props.isDisabled || props.disabled || props.isLoading;

            return {
                color: disabled ? colors.grey[50] : colors.whites.offwhite,
                cursor: disabled ? "not-allowed" : "pointer",

                background: disabled
                    ? "radial-gradient(95.81% 135.6% at 100% 0%, rgba(255, 255, 255, 0.99) 0%,rgb(175, 250, 140) 100%)"
                    : "radial-gradient(35.81% 85.6% at 40% 30%, rgba(127, 221, 142, 0.81) 0%,rgb(0, 183, 104) 100%)",
                backgroundSize: "300% 300%",
                backgroundPosition: "0% 90%",
                transition: disabled
                    ? "none"
                    : "background-position 2s ease-in-out",

                _hover: disabled
                    ? {}
                    : {
                          backgroundPosition: "100% 0%",
                          transition:
                              "background-position 2s ease-in-out, transform 0.2s ease-out",
                      },

                _active: disabled
                    ? {}
                    : {
                          background:
                              "radial-gradient(35.81% 85.6% at 40% 30%, rgba(122, 208, 129, 0.81) 0%,rgb(0, 139, 79) 100%)",
                      },

                _focus: {
                    boxShadow: disabled ? "none" : shadow["focus-button"],
                },
            };
        },
        primary: (props: StyleFunctionProps) => {
            const disabled =
                props.isDisabled || props.disabled || props.isLoading;
            return {
                color: disabled ? colors.grey[200] : colors.font.white,
                background: disabled
                    ? colors.grey[100]
                    : darkThemeColors.green.primary400,
                _dark: {
                    background: disabled
                        ? darkThemeColors.green.primary500
                        : darkThemeColors.green.primary700,
                    _hover: {
                        bg: disabled
                            ? `${colors.green[500]} !important`
                            : darkThemeColors.green.primary600,
                    },
                },
                border: disabled
                    ? `none`
                    : `1px solid rgba(120, 241, 201, 0.67)`,
                _hover: {
                    bg: disabled
                        ? `${colors.grey[100]} !important`
                        : darkThemeColors.green.primary500,
                },
                _active: {
                    bg: disabled
                        ? colors.grey[200]
                        : darkThemeColors.green.primary500,
                },
                _focus: {
                    boxShadow: disabled ? "none" : shadow["focus-button"],
                },
                cursor: disabled ? "not-allowed" : "pointer",
            };
        },
        secondary: (props: StyleFunctionProps) => {
            const disabled =
                props.isDisabled || props.disabled || props.isLoading;
            return {
                color: disabled ? colors.grey[300] : colors.font.primary,
                background: disabled ? colors.grey[100] : colors.font.white,
                border: disabled ? `none` : "1px solid rgba(1, 134, 90, 0.67)",
                _dark: {
                    background: disabled ? colors.grey[700] : colors.grey[800],
                    _hover: {
                        bg: disabled
                            ? `${colors.grey[900]} !important`
                            : colors.grey[700],
                    },
                    _active: {
                        bg: disabled ? colors.grey[800] : colors.grey[700],
                    },
                },
                _hover: {
                    bg: disabled
                        ? `${colors.grey[50]} !important`
                        : colors.grey[50],
                },
                _active: {
                    bg: disabled ? colors.grey[200] : "grey.50",
                },
                _focus: {
                    boxShadow: disabled ? "none" : shadow["focus-button"],
                },
                cursor: disabled ? "not-allowed" : "pointer",
            };
        },
        ghost: (props: StyleFunctionProps) => {
            const disabled =
                props.isDisabled || props.disabled || props.isLoading;
            return {
                color: disabled ? colors.grey[300] : colors.font.primary,
                cursor: disabled ? "not-allowed" : "pointer",
                background: "transparent",
                _hover: {
                    border: "none",
                    bg: "transparent",
                },
                _active: {
                    bg: "none",
                },
                _focus: {
                    bg: "none",
                    boxShadow: "none",
                },
            };
        },

        link: (props: StyleFunctionProps) => {
            const disabled =
                props.isDisabled || props.disabled || props.isLoading;
            return {
                color: disabled ? colors.grey[300] : colors.font.primary,
                cursor: disabled ? "not-allowed" : "pointer",
                background: "transparent",
                _hover: {
                    textDecoration: "none",
                    color: disabled ? colors.grey[300] : colors.whites.offwhite,
                },
            };
        },

        /**
         * @see :
         * - src/themeNew/components/menu.ts
         * - src/components/Molecules/Inputs/SelectInput.tsx
         */
        select: (props: StyleFunctionProps) => {
            const isPlaceholder = props["data-is-placeholder"];

            const { color, ...textStyle } = textStyles["body-md"];

            return {
                height: "48px",
                padding: "p-sm",

                color: isPlaceholder ? colors.grey[300] : color,
                background: colors.font.white,

                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: borderRadius.xs,
                borderColor: {
                    _light: colors.grey[100],
                    _dark: colors.grey[900],
                },
                _dark: {
                    background: colors.grey[700],
                },
                _hover: {
                    borderColor: colors.grey[950],
                },
                _active: {
                    borderColor: colors.grey[950],
                },
                _disabled: {
                    background: colors.grey[50],
                    color: colors.font.disabled,
                    "& .chakra-button__icon": {
                        color: colors.grey[400],
                    },
                    "& .chakra-divider": {
                        borderColor: colors.grey[400],
                    },
                },
                "& .chakra-button__icon": {
                    color: colors.grey[950],
                },
                "& .chakra-divider": {
                    borderColor: colors.grey[100],
                },
                ...textStyle,
            };
        },
    },

    defaultProps: {
        variant: "primary",
        size: "md",
    },
};

export default Button;
