import { useColorMode } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";
import Button from "components/ui/Button";
import { getGlassInk } from "components/ui/GlassNav";
import { GlassSurface } from "components/ui/GlassNav/GlassSurface";

type Option<T extends string> = {
    value: T;
    label: string;
    icon?: LucideIcon;
    size?: "xs" | "sm" | "md" | "lg";
    color?: string;
};

type MultiOptionButtonsProps<T extends string> = {
    options: Option<T>[];
    value: T;
    onChange: (v: T) => void;
    size?: "xs" | "sm" | "md" | "lg";
};

/**
 * Sélecteur segmenté en verre dépoli (même langage visuel que GlassNav) : le verre suit le
 * colorMode de l'app, l'option active est une pastille plus claire posée dessus (sans ombre).
 */
function MultiOptionButtons<T extends string>({ options, value, onChange, size = "xs" }: MultiOptionButtonsProps<T>) {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const ink = getGlassInk(colorMode);

    const activeBg = isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.95)";

    return (
        <GlassSurface
            variant={colorMode}
            blur={12}
            withBoxShadow={false}
            borderRadius="full"
            display="inline-flex"
            alignItems="center"
            gap={1}
            p={1}
            flexShrink={0}
            maxW="100%"
        >
            {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                    <Button
                        key={opt.value}
                        size={size}
                        variant="ghost"
                        leftIcon={opt.icon}
                        onClick={() => onChange(opt.value)}
                        position="relative"
                        borderRadius="full"
                        fontWeight={isActive ? "semibold" : "medium"}
                        color={isActive ? ink.text : ink.muted}
                        bg={isActive ? activeBg : "transparent"}
                        transition="background 0.15s, color 0.15s"
                        _hover={{ bg: isActive ? activeBg : ink.pillBg, color: ink.text }}
                        _active={{ bg: isActive ? activeBg : ink.pillBg }}
                        aria-pressed={isActive}
                    >
                        {opt.label}
                    </Button>
                );
            })}
        </GlassSurface>
    );
}

export default MultiOptionButtons;
