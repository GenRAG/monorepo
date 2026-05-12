import colors from "themeNew/foundations/colors";

const PinInput = {
    variants: {
        default: {
            // border: `1px solid ${colors.grey[500]}`,
            // background: colors.grey[100],
            border: `1px solid ${colors.grey[50]}`,
            background: "white",
            borderRadius: "4px",
            _hover: {
                borderColor: colors.grey[950],
            },
            _focus: {
                borderColor: colors.grey[950],
            },
            _invalid: {
                borderColor: colors.red[600],
            },
            _disabled: {
                backgroundColor: colors.grey[100],
                cursor: "not-allowed",
                _placeholder: {
                    color: colors.font.disabled,
                },
            },
        },
    },
    sizes: {
        lg: {
            w: "48px",
            h: "48px",
        },
        md: {
            w: "40px",
            h: "40px",
        },
        sm: {
            w: "32px",
            h: "32px",
        },
    },
    // border: `1px solid ${colors.grey[700]}`,
    defaultProps: {
        size: "md",
        variant: "default",
    },
};

export default PinInput;
