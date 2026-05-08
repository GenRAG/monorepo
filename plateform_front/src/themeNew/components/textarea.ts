import { defineStyleConfig } from "@chakra-ui/react";
import { textStyles } from "themeNew/foundations/typography";

const fieldStyles = {
    ...textStyles?.["body-md"],
    borderWidth: "1px",
    borderStyle: "solid",
    bg: "inputBg",
    borderRadius: "4px",
    borderColor: "inputBorder",
    color: "inputText",
    _hover: {
        borderColor: "inputBorder",
    },
    _disabled: {
        bg: "grey.50",
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
    },
};

const Textarea = defineStyleConfig({
    baseStyle: fieldStyles,
    variants: {
        default: fieldStyles,
    },
    defaultProps: {
        variant: "default",
    },
});

export default Textarea;
