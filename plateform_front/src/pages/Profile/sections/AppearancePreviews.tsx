import type { ReactNode } from "react";
import { Box, Center, HStack, Icon, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Check } from "lucide-react";
import type { SidebarLayoutMode } from "store/navigationSlice";
import type { ThemeMode } from "hooks/useThemeMode";
import { GLASS_FOCUS_RING } from "themeNew/foundations/glass";

type Tone = "light" | "dark";
type NavShape = "sidebar" | "bottombar";

// Couleurs de palette et non tokens sémantiques : un aperçu « clair » doit rester clair même en mode sombre.
const PALETTE: Record<Tone, { bg: string; nav: string; line: string; card: string }> = {
    light: { bg: "grey.50", nav: "white", line: "grey.200", card: "white" },
    dark: { bg: "grey.975", nav: "grey.850", line: "grey.700", card: "grey.900" },
};

/** Fenêtre miniature de l'app : la navigation, un titre en accent et deux cartes. */
const MiniApp = ({ tone, nav }: { tone: Tone; nav: NavShape }) => {
    const p = PALETTE[tone];
    const isSidebar = nav === "sidebar";
    return (
        <Box position="absolute" inset={0} bg={p.bg}>
            <Box
                position="absolute"
                bg={p.nav}
                border="1px solid"
                borderColor={p.line}
                borderRadius="full"
                {...(isSidebar
                    ? { left: "5%", top: "12%", bottom: "12%", w: "9%" }
                    : { left: "32%", right: "32%", bottom: "8%", h: "13%" })}
            />
            <VStack
                position="absolute"
                left={isSidebar ? "20%" : "8%"}
                right="8%"
                top="12%"
                align="stretch"
                spacing="8px"
            >
                <Box h="6px" w="35%" borderRadius="full" bg="green.400" />
                <HStack spacing="6%">
                    {[0, 1].map((i) => (
                        <Box
                            key={i}
                            flex={1}
                            h="26px"
                            borderRadius="4px"
                            bg={p.card}
                            border="1px solid"
                            borderColor={p.line}
                        />
                    ))}
                </HStack>
                <Box h="4px" w="70%" borderRadius="full" bg={p.line} />
            </VStack>
        </Box>
    );
};

export const ThemePreview = ({ mode }: { mode: ThemeMode }) =>
    mode === "system" ? (
        <>
            <MiniApp tone="dark" nav="sidebar" />
            <Box position="absolute" inset={0} clipPath="polygon(0 0, 55% 0, 45% 100%, 0 100%)">
                <MiniApp tone="light" nav="sidebar" />
            </Box>
        </>
    ) : (
        <MiniApp tone={mode} nav="sidebar" />
    );

/** Aperçu dans le thème courant ; « auto » montre l'ordinateur (sidebar) et le téléphone (barre du bas). */
export const NavPreview = ({ mode }: { mode: SidebarLayoutMode }) => {
    const { colorMode } = useColorMode();
    if (mode !== "auto") return <MiniApp tone={colorMode} nav={mode} />;
    return (
        <>
            <MiniApp tone={colorMode} nav="sidebar" />
            <Box
                position="absolute"
                right="6%"
                bottom="-12%"
                w="26%"
                h="84%"
                borderRadius="8px"
                border="2px solid"
                borderColor={PALETTE[colorMode].line}
                overflow="hidden"
            >
                <MiniApp tone={colorMode} nav="bottombar" />
            </Box>
        </>
    );
};

interface PreviewOptionProps {
    label: string;
    isActive: boolean;
    onSelect: () => void;
    children: ReactNode;
}

/** Choix illustré par un aperçu, à la manière des réglages d'apparence d'un système d'exploitation. */
export const PreviewOption = ({ label, isActive, onSelect, children }: PreviewOptionProps) => (
    <VStack
        as="button"
        type="button"
        aria-pressed={isActive}
        onClick={onSelect}
        spacing={2}
        align="stretch"
        role="group"
        outline="none"
        _focusVisible={{ "& > div:first-of-type": { boxShadow: GLASS_FOCUS_RING } }}
    >
        <Box
            position="relative"
            h="92px"
            borderRadius="10px"
            overflow="hidden"
            border="2px solid"
            borderColor={isActive ? "borderAccentCardActive" : "borderDefault"}
            transition="border-color 0.15s"
            _groupHover={isActive ? undefined : { borderColor: "borderStrong" }}
        >
            {children}
            {isActive && (
                <Center
                    position="absolute"
                    top="6px"
                    right="6px"
                    boxSize="18px"
                    borderRadius="full"
                    bg="accentBadgeBg"
                    color="accentBadgeText"
                >
                    <Icon as={Check} boxSize="11px" strokeWidth={3} />
                </Center>
            )}
        </Box>
        <Text
            fontSize="sm"
            textAlign="center"
            fontWeight={isActive ? "600" : "400"}
            color={isActive ? "textPrimary" : "textLabel"}
        >
            {label}
        </Text>
    </VStack>
);
