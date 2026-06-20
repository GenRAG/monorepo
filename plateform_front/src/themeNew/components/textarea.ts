import { defineStyleConfig } from "@chakra-ui/react";
import borderRadius from "themeNew/foundations/borderRadius";
import { textStyles } from "themeNew/foundations/typography";

const fieldStyles = {
    ...textStyles?.["body-md"],
    borderWidth: "1px",
    borderStyle: "solid",
    bg: "inputBg",
    borderRadius: borderRadius.md,
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
