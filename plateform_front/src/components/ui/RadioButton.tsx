import type { ReactNode } from "react";
import { Box, HStack, Text, VStack, type BoxProps } from "@chakra-ui/react";

interface RadioButtonProps extends BoxProps {
    icon: ReactNode;
    title: string;
    subtitle: string;
    isSelected: boolean;
    onClick: () => void;
}

const RadioButton = ({ icon, title, subtitle, isSelected, onClick, ...props }: RadioButtonProps) => {
    return (
        <Box
            p={4}
            bg={isSelected ? "accentCardBg" : "transparent"}
            borderBottom="1px solid"
            border={isSelected ? "2px solid" : "0px 0px 1px 0px solid"}
            borderBottomColor="borderDefault"
            _last={isSelected ? {} : { borderBottom: "none" }}
            borderRadius={0}
            cursor="pointer"
            onClick={onClick}
            borderColor={isSelected ? "iconAccent" : "borderDivider"}
            _hover={{
                bg: isSelected ? undefined : "surfaceHover",
            }}
            {...props}
        >
            <HStack justify="space-between">
                <HStack spacing={3}>
                    <Box
                        color={isSelected ? "iconAccent" : "textSubtle"}
                        bg={isSelected ? "bubbleAccentBg" : "surfaceSubtle"}
                        w="32px"
                        h="32px"
                        borderRadius="8px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        {icon}
                    </Box>

                    <VStack align="start" spacing={0.5}>
                        <Text fontSize="14px" fontWeight={500} color="textPrimary">
                            {title}
                        </Text>
                        <Text fontSize="12px" color="textSubtle">
                            {subtitle}
                        </Text>
                    </VStack>
                </HStack>

                <Box
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={isSelected ? "iconAccent" : "borderDivider"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    transition="all 0.15s"
                    position="relative"
                >
                    {isSelected && (
                        <Box
                            w="7px"
                            h="7px"
                            borderRadius="full"
                            bg="iconAccent"
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                        />
                    )}
                </Box>
            </HStack>
        </Box>
    );
};

export default RadioButton;
