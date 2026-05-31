import React, { FC } from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface Props {
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

export const TemplateCard: FC<Props> = ({ title, description, isSelected, onClick }) => {
    const titleColor = useColorModeValue(isSelected ? "green.600" : "grey.900", "grey.50");
    const tplCardHoverBg = useColorModeValue("grey.50", "grey.850");

    const borderColor = isSelected ? "green.500" : "borderDefault";
    const bgColor = isSelected ? "accentCardBg" : "surfaceModal";
    const hoverBgColor = isSelected ? "accentCardBg" : tplCardHoverBg;
    const hoverBorderColor = isSelected ? "green.500" : "grey.400";

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
            <Text variant="body-sm" color={titleColor}>
                {title}
            </Text>
            <Text variant="body-xs" color="textSecondary">
                {description}
            </Text>
        </Box>
    );
};

export default TemplateCard;
