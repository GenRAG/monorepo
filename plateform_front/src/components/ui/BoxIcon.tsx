import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

const BoxIcon = ({
    icon,
    letters,
    color = "green.500",
    bg = "accentIconBg",
    size = "md",
    onClick,
    spin = false,
}: {
    icon?: LucideIcon | React.ComponentType<React.ComponentProps<any>>;
    letters?: string;
    color?: string;
    bg?: string;
    size?: "sm" | "md" | "lg" | "xl";
    onClick?: () => void;
    spin?: boolean;
}) => {
    const iconSize = size === "sm" ? 14 : size === "md" ? 16 : size === "lg" ? 20 : 24;
    const IconComp = icon as React.ComponentType<{ size?: number }> | undefined;

    const width = size === "sm" ? "28px" : size === "md" ? "36px" : size === "lg" ? "44px" : "52px";
    const height = size === "sm" ? "28px" : size === "md" ? "36px" : size === "lg" ? "44px" : "52px";

    return (
        <Box
            w={width}
            h={height}
            borderRadius="8px"
            bg={bg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            color={color}
            onClick={onClick}
            cursor={onClick ? "pointer" : "default"}
        >
            {IconComp ? (
                <Box
                    as="span"
                    display="flex"
                    sx={
                        spin
                            ? {
                                  "@keyframes boxicon-spin": {
                                      from: { transform: "rotate(0deg)" },
                                      to: { transform: "rotate(360deg)" },
                                  },
                                  animation: "boxicon-spin 1s linear infinite",
                              }
                            : undefined
                    }
                >
                    <IconComp size={iconSize} />
                </Box>
            ) : letters ? (
                <Text
                    fontSize={size === "sm" ? "10px" : size === "md" ? "12px" : size === "lg" ? "14px" : "18px"}
                    fontWeight="bold"
                    color={color}
                    textTransform="uppercase"
                    lineHeight="1"
                >
                    {letters}
                </Text>
            ) : null}
        </Box>
    );
};

export default BoxIcon;
