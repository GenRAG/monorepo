import type { ReactNode } from "react";
import { Box, HStack, Text, VStack, useColorModeValue, type BoxProps } from "@chakra-ui/react";

interface RadioButtonProps extends BoxProps {
    icon: ReactNode;
    title: string;
    subtitle: string;
    isSelected: boolean;
    onClick: () => void;
}

const RadioButton = ({ icon, title, subtitle, isSelected, onClick, ...props }: RadioButtonProps) => {
    const selectedBg = useColorModeValue("green.50", "green.950");
    const textColor = useColorModeValue("grey.900", "grey.50");
    const subtitleColor = useColorModeValue("grey.300", "grey.600");
    const iconColor = useColorModeValue("grey.300", "grey.600");
    const iconBg = useColorModeValue("grey.50", "grey.800");
    const iconSelectedBg = useColorModeValue("green.100", "green.900");
    const rowBorderColor = useColorModeValue("grey.100", "grey.800");
    const hoverBg = useColorModeValue("grey.25", "grey.900");
    const radioBorderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <Box
            p={4}
            bg={isSelected ? selectedBg : "transparent"}
            borderBottom="1px solid"
            border={isSelected ? "2px solid" : "0px 0px 1px 0px solid"}
            borderBottomColor={rowBorderColor}
            _last={isSelected ? {} : { borderBottom: "none" }}
            borderRadius={0}
            cursor="pointer"
            onClick={onClick}
            borderColor={isSelected ? "green.500" : radioBorderColor}
            _hover={{
                bg: isSelected ? undefined : hoverBg,
            }}
            {...props}
        >
            <HStack justify="space-between">
                <HStack spacing={3}>
                    <Box
                        color={isSelected ? "green.500" : iconColor}
                        bg={isSelected ? iconSelectedBg : iconBg}
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
                        <Text fontSize="14px" fontWeight={500} color={textColor}>
                            {title}
                        </Text>
                        <Text fontSize="12px" color={subtitleColor}>
                            {subtitle}
                        </Text>
                    </VStack>
                </HStack>

                <Box
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={isSelected ? "green.500" : radioBorderColor}
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
                            bg="green.500"
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
