import { defineStyleConfig } from "@chakra-ui/react";

import colors from "themeNew/foundations/colors";

const Divider = defineStyleConfig({
    baseStyle: {
        borderColor: colors.grey[50],
        borderWidth: "1px",
        borderStyle: "solid",
    },
});
export default Divider;
