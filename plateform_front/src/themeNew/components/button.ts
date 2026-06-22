import { StyleFunctionProps } from "@chakra-ui/styled-system";

import borderRadius from "themeNew/foundations/borderRadius";
import colors from "themeNew/foundations/colors";
import { shadow } from "themeNew/foundations/shadow";
import { darkThemeColors } from "themeNew/foundations/themeConfig";
import { textStyles } from "themeNew/foundations/typography";

const Button = {
    baseStyle: {
        borderRadius: borderRadius.sm,
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
            const disabled = props.isDisabled || props.disabled || props.isLoading;

            return {
                color: disabled ? colors.grey[300] : colors.whites.white,
                cursor: disabled ? "not-allowed" : "pointer",

                background: disabled
                    ? "linear-gradient(130deg, rgba(250, 250, 250, 0.9) 0%, rgba(240, 238, 238, 0.9) 100%)"
                    : "radial-gradient(120% 120% at 100% 0%, rgba(93, 223, 188, 0.4) 0%, rgba(81, 248, 203, 0.34) 48%), linear-gradient(130deg, #12B98C 0%, #07966F 55%, #07b889 100%)",
                border: disabled ? "1px solid rgba(209, 209, 209, 0.95)" : "1px solid rgba(168, 243, 223, 0.7)",
                backgroundSize: "180% 180%",
                backgroundPosition: "0% 50%",
                transition: disabled
                    ? "none"
                    : "background-position 0.45s ease, transform 0.2s ease, box-shadow 0.2s ease",

                _hover: disabled
                    ? {
                          background:
                              "linear-gradient(130deg, rgba(250, 250, 250, 0.9) 0%, rgba(240, 238, 238, 0.9) 100%)",
                      }
                    : {
                          transform: "translateY(-1px)",
                      },

                _active: disabled
                    ? {}
                    : {
                          transform: "translateY(0)",
                          background:
                              "radial-gradient(120% 120% at 100% 0%, rgba(43, 235, 184, 0.28) 0%, rgba(20, 228, 172, 0) 48%), linear-gradient(130deg, #0cdaa3 0%, #0fd19d 100%)",
                      },

                _focus: {
                    boxShadow: disabled ? "none" : shadow["focus-button"],
                },

                _dark: {
                    color: disabled ? colors.grey[600] : colors.grey[900],
                    background: disabled
                        ? "grey.800"
                        : "radial-gradient(120% 120% at 100% 0%, rgba(121, 221, 194, 0.3) 0%, rgba(125, 235, 205, 0) 48%), linear-gradient(130deg, #14daaf 0%, #19e4b1 55%, #04cfa3 100%)",
                    border: disabled ? "1px solid rgba(100, 100, 100, 0.95)" : "1px solid rgba(90, 200, 170, 0.6)",
                    _hover: disabled
                        ? { background: "grey.800 !important" }
                        : {
                              backgroundPosition: "100% 50%",
                              transform: "translateY(-1px)",
                          },
                    _active: disabled
                        ? {}
                        : {
                              transform: "translateY(0)",
                              background:
                                  "radial-gradient(120% 120% at 100% 0%, rgba(93, 223, 188, 0.4) 0%, rgba(81, 248, 203, 0.34) 48%), linear-gradient(130deg, #12B98C 0%, #07966F 55%, #07b889 100%)",
                          },
                },
            };
        },
        superSecondary: (props: StyleFunctionProps) => {
            const disabled = props.isDisabled || props.disabled || props.isLoading;

            return {
                color: disabled ? colors.grey[50] : colors.whites.offwhite,
                cursor: disabled ? "not-allowed" : "pointer",

                background: disabled
                    ? "radial-gradient(95.81% 135.6% at 100% 0%, rgba(255, 255, 255, 0.99) 0%,rgb(175, 250, 140) 100%)"
                    : "radial-gradient(35.81% 85.6% at 40% 30%, rgba(127, 221, 142, 0.81) 0%,rgb(0, 183, 104) 100%)",
                backgroundSize: "300% 300%",
                backgroundPosition: "0% 90%",
                transition: disabled ? "none" : "background-position 2s ease-in-out",

                _hover: disabled
                    ? {}
                    : {
                          backgroundPosition: "100% 0%",
                          transition: "background-position 2s ease-in-out, transform 0.2s ease-out",
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

                _dark: {
                    color: disabled ? colors.grey[700] : colors.whites.white,
                    background: disabled
                        ? "radial-gradient(95.81% 135.6% at 100% 0%, rgba(80, 80, 80, 0.95) 0%,rgb(60, 140, 80) 100%)"
                        : "radial-gradient(35.81% 85.6% at 40% 30%, rgba(70, 180, 100, 0.8) 0%,rgb(0, 130, 80) 100%)",
                    backgroundSize: "300% 300%",
                    backgroundPosition: "0% 90%",
                    _hover: disabled
                        ? {}
                        : {
                              backgroundPosition: "100% 0%",
                              transition: "background-position 2s ease-in-out, transform 0.2s ease-out",
                          },
                    _active: disabled
                        ? {}
                        : {
                              background:
                                  "radial-gradient(35.81% 85.6% at 40% 30%, rgba(60, 160, 90, 0.8) 0%,rgb(0, 100, 60) 100%)",
                          },
                    _focus: {
                        boxShadow: disabled ? "none" : shadow["focus-button"],
                    },
                },
            };
        },
        primary: (props: StyleFunctionProps) => {
            const disabled = props.isDisabled || props.disabled || props.isLoading;
            return {
                color: disabled ? colors.grey[200] : colors.font.white,
                background: disabled ? colors.grey[100] : darkThemeColors.green.primary400,
                _dark: {
                    background: disabled ? "grey.800" : darkThemeColors.green.primary700,
                    _hover: {
                        bg: disabled ? "grey.800 !important" : darkThemeColors.green.primary600,
                    },
                    color: disabled ? colors.grey[600] : colors.whites.white,
                },
                border: disabled ? `none` : `1px solid rgba(120, 241, 201, 0.67)`,
                _hover: {
                    bg: disabled ? `${colors.grey[100]} !important` : darkThemeColors.green.primary500,
                },
                _active: {
                    bg: disabled ? colors.grey[200] : darkThemeColors.green.primary500,
                },
                _focus: {
                    boxShadow: disabled ? "none" : shadow["focus-button"],
                },
                cursor: disabled ? "not-allowed" : "pointer",
            };
        },
        secondary: (props: StyleFunctionProps) => {
            const disabled = props.isDisabled || props.disabled || props.isLoading;
            return {
                color: disabled ? colors.grey[300] : colors.font.primary,
                background: disabled ? colors.grey[100] : colors.font.white,
                border: disabled ? `none` : "1px solid rgba(214, 214, 214, 0.67)",
                _dark: {
                    border: disabled ? `none` : "1px solid rgba(92, 92, 92, 0.67)",
                    background: disabled ? colors.grey[700] : colors.grey[900],
                    _hover: {
                        bg: disabled ? `${colors.grey[900]} !important` : colors.grey[700],
                    },
                    _active: {
                        bg: disabled ? colors.grey[800] : colors.green[700],
                    },
                },
                _hover: {
                    bg: disabled ? `${colors.grey[50]} !important` : colors.grey[50],
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
            const disabled = props.isDisabled || props.disabled || props.isLoading;
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
                _dark: {
                    color: disabled ? colors.grey[600] : colors.grey[100],
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
                },
            };
        },

        link: (props: StyleFunctionProps) => {
            const disabled = props.isDisabled || props.disabled || props.isLoading;
            return {
                color: disabled ? colors.grey[300] : colors.font.primary,
                cursor: disabled ? "not-allowed" : "pointer",
                background: "transparent",
                _hover: {
                    textDecoration: "none",
                    color: disabled ? colors.grey[300] : colors.whites.offwhite,
                },
                _dark: {
                    color: disabled ? colors.grey[600] : colors.grey[200],
                    _hover: {
                        textDecoration: "none",
                        color: disabled ? colors.grey[600] : colors.green[300],
                    },
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
        variant: "superPrimary",
        size: "md",
    },
};

export default Button;
