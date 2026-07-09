import { HStack, useColorModeValue } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";
import Button from "components/ui/Button";

type Option<T extends string> = {
    value: T;
    label: string;
    icon?: LucideIcon;
    size?: "xs" | "sm" | "md" | "lg";
};

type MultiOptionButtonsProps<T extends string> = {
    options: Option<T>[];
    value: T;
    onChange: (v: T) => void;
    size?: "xs" | "sm" | "md" | "lg";
};

function MultiOptionButtons<T extends string>({ options, value, onChange, size = "xs" }: MultiOptionButtonsProps<T>) {
    const bgColor = useColorModeValue("grey.50", "grey.900");

    return (
        <HStack spacing={2} p={1} bg={bgColor} borderRadius="8px" flexShrink={0}>
            {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                    <Button
                        key={opt.value}
                        size={size}
                        variant={isActive ? "superPrimary" : "ghost"}
                        leftIcon={opt.icon}
                        onClick={() => onChange(opt.value)}
                        w="100%"
                    >
                        {opt.label}
                    </Button>
                );
            })}
        </HStack>
    );
}

export default MultiOptionButtons;
