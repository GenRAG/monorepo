import { sliderAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import colors from "themeNew/foundations/colors";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);
const baseStyle = definePartsStyle({
    thumb: {
        bg: colors.whites.white,
        border: `6px solid ${colors.content.gold} !important`,
        w: "20px",
        h: "20px",
    },
    filledTrack: {
        bg: colors.gold[100],
    },
});
export const Slider = defineMultiStyleConfig({ baseStyle });
