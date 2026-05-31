import { Box, HStack } from "@chakra-ui/react";

type Option<T extends string> = {
    value: T;
    label: string;
};

type MultiOptionButtonsProps<T extends string> = {
    options: Option<T>[];
    value: T;
    onChange: (v: T) => void;
};

function MultiOptionButtons<T extends string>({ options, value, onChange }: MultiOptionButtonsProps<T>) {
    return (
        <HStack spacing={0.5} bg="surfaceSubtle" borderRadius="8px" flexShrink={0}>
            {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                    <Box
                        key={opt.value}
                        as="button"
                        px={2.5}
                        py={1}
                        borderRadius="6px"
                        bg={isActive ? "surfacePrimary" : "transparent"}
                        fontSize="12px"
                        fontWeight={isActive ? "600" : "400"}
                        color={isActive ? "textPrimary" : "textLabel"}
                        onClick={() => onChange(opt.value)}
                        transition="all 0.15s"
                        boxShadow={isActive ? "sm" : "none"}
                    >
                        {opt.label}
                    </Box>
                );
            })}
        </HStack>
    );
}

export default MultiOptionButtons;
