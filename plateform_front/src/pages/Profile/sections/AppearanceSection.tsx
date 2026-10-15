import type { ReactNode } from "react";
import { Box, Divider, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useThemeMode, type ThemeMode } from "hooks/useThemeMode";
import { useAppDispatch, useAppSelector } from "store";
import { setSidebarLayoutMode, type SidebarLayoutMode } from "store/navigationSlice";
import { ProfileBlock } from "../ProfileBlock";
import { NavPreview, PreviewOption, ThemePreview } from "./AppearancePreviews";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
    { value: "light", label: "Clair" },
    { value: "dark", label: "Sombre" },
    { value: "system", label: "Système" },
];

const NAV_OPTIONS: { value: SidebarLayoutMode; label: string }[] = [
    { value: "auto", label: "Automatique" },
    { value: "sidebar", label: "Barre latérale" },
    { value: "bottombar", label: "Barre du bas" },
];

const Group = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
    <VStack align="stretch" spacing={4}>
        <Box>
            <Text variant="body-sm-semibold">{title}</Text>
            <Text fontSize="xs" color="textMuted">
                {description}
            </Text>
        </Box>
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} maxW="640px">
            {children}
        </SimpleGrid>
    </VStack>
);

const AppearanceSection = () => {
    const dispatch = useAppDispatch();
    const layoutMode = useAppSelector((state) => state.navigation.sidebarLayoutMode);
    const { themeMode, setThemeMode } = useThemeMode();

    return (
        <ProfileBlock title="Apparence" subtitle="Le thème et la navigation de l'application.">
            <VStack align="stretch" spacing={6}>
                <Group title="Thème" description="« Système » reprend le réglage clair ou sombre de votre appareil.">
                    {THEME_OPTIONS.map(({ value, label }) => (
                        <PreviewOption
                            key={value}
                            label={label}
                            isActive={themeMode === value}
                            onSelect={() => setThemeMode(value)}
                        >
                            <ThemePreview mode={value} />
                        </PreviewOption>
                    ))}
                </Group>

                <Divider borderColor="borderDefault" />

                <Group
                    title="Navigation"
                    description="« Automatique » affiche la barre latérale sur ordinateur et la barre du bas sur mobile."
                >
                    {NAV_OPTIONS.map(({ value, label }) => (
                        <PreviewOption
                            key={value}
                            label={label}
                            isActive={layoutMode === value}
                            onSelect={() => dispatch(setSidebarLayoutMode(value))}
                        >
                            <NavPreview mode={value} />
                        </PreviewOption>
                    ))}
                </Group>
            </VStack>
        </ProfileBlock>
    );
};

export default AppearanceSection;
