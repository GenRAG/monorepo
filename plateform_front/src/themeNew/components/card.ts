import { cardAnatomy } from "@chakra-ui/anatomy";
import { CardProps } from "@chakra-ui/react";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import colors from "themeNew/foundations/colors";

type PortfolioType = keyof typeof colors.gradients;

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(cardAnatomy.keys);

const cardColors = {
    base: {
        borderColor: colors.grey[50],
        backgroundColor: colors.whites.white,
    },
    gold: {
        borderColor: colors.gold[100],
        backgroundColor: colors.gold[50],
    },
};

type CardColorScheme = keyof typeof cardColors;

const Card = defineMultiStyleConfig({
    baseStyle: (props: CardProps) => ({
        container: {
            boxShadow: "none",
            borderRadius: "8px",
            borderWidth: "1px",
            position: "relative",
            ...cardColors[(props.colorScheme as CardColorScheme) ?? "base"],
        },
    }),

    sizes: {
        none: {
            container: {
                padding: "0px",
            },
        },
        xs: {
            container: {
                padding: "8px",
            },
        },
        sm: {
            container: {
                padding: "16px",
            },
        },
        md: {
            container: {
                padding: { base: "16px", md: "24px" },
            },
        },
    },

    variants: {
        // @ts-ignore ts(2322)
        portfolio: ({ type }: { type: PortfolioType }) => ({
            container: {
                bgGradient: colors.gradients[type],
                borderColor: "transparent",
                _hover: {
                    cursor: "pointer",
                    borderColor: colors.grey[200],
                },
            },
        }),
        clickable: {
            container: {
                cursor: "pointer",
                _hover: {
                    borderColor: colors.grey[200],
                },
            },
        },
    },

    defaultProps: {
        size: "md",
    },
});

export default Card;
