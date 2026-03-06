import { baseTextStyle, textStyles } from "themeNew/foundations/typography";

const Text = {
    baseStyle: {
        ...baseTextStyle,
    },
    variants: {
        /// --> Body
        ...textStyles,
    },
    defaultProps: {
        variant: "body-md",
    },
};

export default Text;

export type TextVariantKeysType = keyof typeof Text.variants;
export type TextBaseStyleKeysType = keyof typeof Text.baseStyle;
export type TextStyleKeysType =
    | keyof typeof Text.variants
    | keyof typeof Text.baseStyle;
export const TextStyleKeys = [
    ...Object.keys(Text.variants),
    ...Object.keys(Text.baseStyle),
] as (TextVariantKeysType | TextBaseStyleKeysType)[];
