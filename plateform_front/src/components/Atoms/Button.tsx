import React, { FC } from "react";
import {
    Button as ChakraButton,
    ButtonProps,
    Icon,
    IconProps,
} from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

export interface RamifyButtonProps
    extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    icon?: LucideIcon;
    iconProps?: IconProps;
    btnType?: "default" | "icon";
}

const sizeBoxes: Record<string, number | string> = {
    xl: "60px",
    lg: "48px",
    md: "40px",
    sm: "32px",
    xs: "24px",
};

const iconSizes: Record<string, number | string> = {
    xl: "20px",
    lg: "20px",
    md: "16px",
    sm: "16px",
    xs: "16px",
};

const Button: FC<RamifyButtonProps> = React.forwardRef(
    (
        {
            icon,
            variant,
            leftIcon,
            rightIcon,
            iconProps,
            btnType = "default",
            size = "md",
            ...props
        },
        ref,
    ) => {
        const validSize = typeof size === "string" ? size : "md";
        const iconSize = iconSizes[validSize] || "16px";

        if (btnType === "icon") {
            return (
                <ChakraButton
                    size={`icon-${size}`}
                    height={sizeBoxes[validSize] as string}
                    width={sizeBoxes[validSize] as string}
                    variant={variant}
                    ref={ref}
                    {...props}
                    onClick={(e) => {
                        e.currentTarget.blur();
                        props.onClick?.(e);
                    }}
                >
                    <Icon as={icon} boxSize={iconSize} {...iconProps} />
                </ChakraButton>
            );
        }
        const iconLeft = leftIcon ? (
            <Icon as={leftIcon} boxSize={iconSize} {...iconProps} />
        ) : undefined;
        const iconRight = rightIcon ? (
            <Icon as={rightIcon} boxSize={iconSize} {...iconProps} />
        ) : undefined;

        return (
            <ChakraButton
                size={size}
                variant={variant}
                leftIcon={iconLeft}
                rightIcon={iconRight}
                {...props}
                ref={ref}
                onClick={(e) => {
                    e.currentTarget.blur();
                    props.onClick?.(e);
                }}
            >
                {props.children}
            </ChakraButton>
        );
    },
);

export default Button;
