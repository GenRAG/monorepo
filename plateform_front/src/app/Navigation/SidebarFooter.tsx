import { Box, Divider, HStack, Icon, Stack, Text, VStack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { LogOut, MessageSquare, Monitor, Moon, Scale, Sun, User, type LucideIcon } from "lucide-react";
import { ComponentProps, ReactNode, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "store";
import { setLastWorkspaceId } from "store/navigationSlice";
import BoxIcon from "components/ui/BoxIcon";
import { useAuth } from "app/AuthContext";
import { ActionMenu } from "components/ui/ActionMenu";
import { useLogoutUserMutation } from "services/auth/auth";
import { backendApi } from "services/api";
import mixpanel from "lib/mixpanel";

interface SidebarFooterProps {
    isOpen: boolean;
    activeItem: string | null;
    name?: string;
    email?: string;
    supportMenu: { id: string; icon: LucideIcon; label: string }[];
    /**
     * Fourni par un consommateur flottant (ex: GlassNav) qui veut son propre déclencheur (avatar
     * dans une bulle de verre) plutôt que la ligne pleine largeur par défaut : dans ce cas, on
     * saute aussi le chrome (Divider + fond au survol) pensé pour la sidebar dépliable classique,
     * et on ouvre le menu vers le bas plutôt que vers la droite.
     */
    compactTrigger?: ReactNode;
    /**
     * Côté d'ouverture du menu pour `compactTrigger` — "left-end" (défaut) pour un déclencheur
     * ancré à droite de l'écran (GlassNav), "right-start" pour un déclencheur ancré à gauche
     * (ex: AgentSidebar) où ouvrir vers la gauche sortirait de l'écran.
     */
    compactPlacement?: ComponentProps<typeof ActionMenu>["placement"];
}

type ThemeMode = "light" | "dark" | "system";

export const SidebarFooter = ({
    isOpen,
    name,
    email,
    supportMenu,
    compactTrigger,
    compactPlacement = "left-end",
}: SidebarFooterProps) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { logout } = useAuth();
    const [logoutUser] = useLogoutUserMutation();
    const { colorMode, setColorMode } = useColorMode();

    const [themeMode, setThemeMode] = useState<ThemeMode>(
        () => (localStorage.getItem("themeMode") as ThemeMode) ?? colorMode,
    );

    const cardActiveText = useColorModeValue("green.700", "green.400");
    const dangerHoverBg = useColorModeValue("red.50", "grey.900");

    if (!name && !email) return null;

    const displayName = (name || email) ?? "";
    const truncated = displayName.length > 16 ? displayName.slice(0, 16) + "…" : displayName;

    const handleTheme = (mode: ThemeMode) => {
        setThemeMode(mode);
        localStorage.setItem("themeMode", mode);
        if (mode === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setColorMode(prefersDark ? "dark" : "light");
        } else {
            setColorMode(mode);
        }
    };

    const themeOptions: { id: ThemeMode; label: string; icon: LucideIcon }[] = [
        { id: "light", label: "Clair", icon: Sun },
        { id: "dark", label: "Sombre", icon: Moon },
        { id: "system", label: "Système", icon: Monitor },
    ];

    const trigger = (
        <HStack
            ml={0.5}
            spacing={3}
            justify={isOpen ? "flex-start" : "center"}
            w="100%"
            transition="background 0.12s"
            role="button"
        >
            <BoxIcon letters={name?.slice(0, 2) || email?.slice(0, 2)} />
            {isOpen && (
                <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="textStrong" noOfLines={1} flex={1}>
                        {truncated}
                    </Text>
                    <Text fontSize="xs" color="textSecondary" noOfLines={1} flex={1}>
                        {email}
                    </Text>
                </VStack>
            )}
        </HStack>
    );

    const footer = ({ onClose }: { onClose: () => void }) => (
        <Box>
            <Box px={2} pt={2} pb={2}>
                <Text
                    px={2}
                    pb={1}
                    fontSize="10px"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="0.7px"
                    color="textLabel"
                >
                    Apparence
                </Text>
                <HStack spacing={2} px={1} pt={1}>
                    {themeOptions.map(({ id, label, icon }) => {
                        const active = themeMode === id;
                        return (
                            <VStack
                                key={id}
                                flex={1}
                                spacing={1}
                                cursor="pointer"
                                py={2}
                                px={1}
                                borderRadius="8px"
                                borderWidth="1.5px"
                                borderStyle="solid"
                                borderColor={active ? "borderAccentCardActive" : "borderDivider"}
                                bg={active ? "accentCardBg" : "surfaceHover"}
                                onClick={() => handleTheme(id)}
                                transition="all 0.15s"
                                _hover={{ borderColor: active ? "borderAccentCardActive" : "grey.500" }}
                            >
                                <Icon as={icon} boxSize="13px" color={active ? cardActiveText : "textLabel"} />
                                <Text
                                    fontSize="11px"
                                    fontWeight={active ? "600" : "400"}
                                    color={active ? cardActiveText : "textLabel"}
                                >
                                    {label}
                                </Text>
                            </VStack>
                        );
                    })}
                </HStack>
            </Box>
            <Divider borderColor="borderSubtle" />
            <Box px={2} pt={1} pb={2}>
                <HStack
                    px={2}
                    py="7px"
                    borderRadius="8px"
                    cursor="pointer"
                    _hover={{ bg: dangerHoverBg }}
                    transition="background 0.12s"
                    onClick={async () => {
                        onClose();
                        try {
                            await logoutUser().unwrap();
                        } catch {
                            /* ignore network errors — proceed with local logout */
                        }
                        mixpanel.track("user_logged_out");
                        mixpanel.reset();
                        dispatch(backendApi.util.resetApiState());
                        logout();
                        void navigate("/login");
                    }}
                >
                    <Icon as={LogOut} boxSize="14px" color="textError" />
                    <Text fontSize="13px" color="textError" fontWeight="400">
                        Se déconnecter
                    </Text>
                </HStack>
            </Box>
        </Box>
    );

    const sections = [
        {
            label: "Compte",
            items: [
                {
                    label: "Mon profil",
                    icon: <User size={14} />,
                    onClick: () => void navigate("/profile"),
                    shortcut: "⌘ P",
                },
            ],
        },
        {
            label: "Aide & Ressources",
            items: [
                ...supportMenu.map(({ id, icon, label }) => ({
                    label,
                    icon: <Icon as={icon} boxSize="14px" />,
                    onClick: () => {
                        if (id === "help") void navigate("/help");
                        else void navigate("/docs");
                    },
                    external: true,
                })),
                {
                    label: "Contacter le support",
                    icon: <MessageSquare size={14} />,
                    onClick: () => void navigate("/legal/contact"),
                },
                {
                    label: "Données & Légal",
                    icon: <Scale size={14} />,
                    onClick: () => {
                        if (workspaceId) dispatch(setLastWorkspaceId(workspaceId));
                        void navigate("/legal");
                    },
                },
            ],
        },
    ];

    if (compactTrigger) {
        return (
            <ActionMenu
                trigger={compactTrigger}
                sections={sections}
                footer={footer}
                placement={compactPlacement}
                width="250px"
            />
        );
    }

    return (
        <VStack align="stretch" gap={0} w="100%">
            <Divider w="100%" borderColor="borderDefault" borderWidth="1px" />
            <Stack p={2} _hover={{ bg: "surfaceHover" }} transition="background 0.12s" cursor="pointer" w="100%">
                <ActionMenu
                    trigger={trigger}
                    sections={sections}
                    footer={footer}
                    placement="right-start"
                    width="250px"
                />
            </Stack>
        </VStack>
    );
};
