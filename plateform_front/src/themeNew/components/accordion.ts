import { accordionAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(
    accordionAnatomy.keys,
);

const accordionVariant = defineMultiStyleConfig({
    baseStyle: {
        button: {
            _hover: {
                bg: "grey.50",
            },
        },
        container: {},
        panel: {},
        icon: {},
    },
});

export default accordionVariant;
