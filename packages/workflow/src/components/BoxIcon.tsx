import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

const BoxIcon = ({
    icon,
    letters,
    color = "green.500",
    bg = "accentIconBg",
    size = "md",
}: {
    icon?: LucideIcon | React.ComponentType<React.ComponentProps<any>>;
    letters?: string;
    color?: string;
    bg?: string;
    size?: "sm" | "md";
}) => {
    const iconSize = size === "sm" ? 14 : 16;
    const IconComp = icon as React.ComponentType<{ size?: number }> | undefined;

    return (
        <Box
            w={size === "sm" ? "28px" : "36px"}
            h={size === "sm" ? "28px" : "36px"}
            borderRadius="8px"
            bg={bg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            color={color}
        >
            {IconComp ? (
                <IconComp size={iconSize} />
            ) : letters ? (
                <Text fontSize="12px" fontWeight="bold" color={color} textTransform="uppercase" lineHeight="1">
                    {letters}
                </Text>
            ) : null}
        </Box>
    );
};

export default BoxIcon;
