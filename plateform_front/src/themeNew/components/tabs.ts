import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import colors from "themeNew/foundations/colors";
import { textStyles } from "themeNew/foundations/typography";

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(
    tabsAnatomy.keys,
);

const Tabs = defineMultiStyleConfig({
    variants: {
        simple: {
            root: {
                borderBottom: "1px solid",
                borderColor: "grey.100",
            },
            tab: {
                ...textStyles["body-sm"],
                color: colors.font.info,
                padding: "0px",
                _selected: {
                    ...textStyles["body-sm-semibold"],
                    color: colors.font.primary,
                    transition: "border-color 1s",
                },
            },
            tablist: {
                gap: "16px",
            },
        },
    },
});

export default Tabs;
