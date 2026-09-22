import { Box, Divider, HStack, Icon, Text, VStack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { LogOut, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "store";
import { useAuth } from "app/AuthContext";
import { useLogoutUserMutation } from "services/auth/auth";
import { backendApi } from "services/api";
import mixpanel from "lib/mixpanel";

type ThemeMode = "light" | "dark" | "system";

interface SidebarFooterPanelProps {
    onClose: () => void;
}

/** "Apparence" theme picker + logout row, rendered inside SidebarFooter's ActionMenu footer slot. */
export const SidebarFooterPanel = ({ onClose }: SidebarFooterPanelProps) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { logout } = useAuth();
    const [logoutUser] = useLogoutUserMutation();
    const { colorMode, setColorMode } = useColorMode();

    const [themeMode, setThemeMode] = useState<ThemeMode>(
        () => (localStorage.getItem("themeMode") as ThemeMode) ?? colorMode,
    );

    const cardActiveText = useColorModeValue("green.700", "green.400");
    const dangerHoverBg = useColorModeValue("red.50", "grey.900");

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

    return (
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
};
