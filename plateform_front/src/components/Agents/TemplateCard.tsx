import React, { FC } from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface Props {
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

export const TemplateCard: FC<Props> = ({
    title,
    description,
    isSelected,
    onClick,
}) => {
    const dividerColor = useColorModeValue("grey.100", "grey.800");
    const titleColor = useColorModeValue(
        isSelected ? "green.600" : "grey.900",
        "grey.50",
    );
    const tplCardBg = useColorModeValue("white", "grey.900");
    const tplCardHoverBg = useColorModeValue("grey.50", "grey.850");
    const tplCardSelBg = useColorModeValue("green.50", "grey.850");

    const borderColor = isSelected ? "green.500" : dividerColor;
    const bgColor = isSelected ? tplCardSelBg : tplCardBg;
    const hoverBgColor = isSelected ? tplCardSelBg : tplCardHoverBg;
    const hoverBorderColor = isSelected ? "green.500" : "grey.400";

    const textColor = useColorModeValue("grey.600", "grey.400");

    return (
        <Box
            p={3}
            borderRadius="10px"
            border="1.5px solid"
            borderColor={borderColor}
            bg={bgColor}
            cursor="pointer"
            onClick={onClick}
            _hover={{
                bg: hoverBgColor,
                borderColor: hoverBorderColor,
            }}
            transition="all 0.12s"
        >
            <Text fontSize="sm" color={titleColor}>
                {title}
            </Text>
            <Text fontSize="xs" color={textColor}>
                {description}
            </Text>
        </Box>
    );
};

export default TemplateCard;
