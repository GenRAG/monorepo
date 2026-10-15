import { useState } from "react";
import {
    Box,
    Flex,
    Icon,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalOverlay,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { Building2, Monitor, Shield, User } from "lucide-react";
import { useAppResponsive } from "hooks/useAppResponsive";
import { ProfileContent, type ProfileTab } from "./ProfileContent";

const TABS = [
    { value: "info" as const, label: "Informations", icon: User },
    { value: "organization" as const, label: "Entreprise", icon: Building2 },
    { value: "security" as const, label: "Sécurité", icon: Shield },
    { value: "appearance" as const, label: "Apparence", icon: Monitor },
];

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Réglages du compte en modal, navigation à gauche et onglet à droite (sur le modèle de Claude.ai). */
export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
    const [tab, setTab] = useState<ProfileTab>("info");
    const overlayBg = useColorModeValue("whiteAlpha.600", "blackAlpha.600");
    const isMobile = useAppResponsive({ base: true, md: false });

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={isMobile ? "full" : "3xl"}>
            <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
            <ModalContent
                bg="surfaceAppShell"
                borderRadius={{ base: 0, md: "16px" }}
                maxW={{ md: "1000px" }}
                h={{ base: "100%", md: "min(760px, calc(100vh - 64px))" }}
                overflow="hidden"
            >
                <ModalCloseButton top={4} right={4} />
                <Flex direction={{ base: "column", md: "row" }} h="100%" minH={0}>
                    <Stack
                        as="nav"
                        aria-label="Sections du profil"
                        direction={{ base: "row", md: "column" }}
                        spacing={1}
                        w={{ md: "220px" }}
                        flexShrink={0}
                        p={4}
                        pr={{ base: 14, md: 4 }}
                        overflowX={{ base: "auto", md: "visible" }}
                        borderRight="1px solid"
                        borderColor="borderSubtle"
                    >
                        <Text variant="heading-sm" px={3} pb={3} display={{ base: "none", md: "block" }}>
                            Paramètres
                        </Text>
                        {TABS.map(({ value, label, icon }) => {
                            const isActive = tab === value;
                            return (
                                <Flex
                                    key={value}
                                    as="button"
                                    type="button"
                                    aria-current={isActive ? "page" : undefined}
                                    onClick={() => setTab(value)}
                                    align="center"
                                    gap={2.5}
                                    px={3}
                                    py={2}
                                    borderRadius="8px"
                                    flexShrink={0}
                                    fontSize="sm"
                                    fontWeight={isActive ? "600" : "500"}
                                    color={isActive ? "textStrong" : "textSecondary"}
                                    bg={isActive ? "surfaceHover" : "transparent"}
                                    _hover={{ bg: "surfaceHover", color: "textStrong" }}
                                    transition="background 0.12s, color 0.12s"
                                >
                                    <Icon as={icon} boxSize={4} />
                                    {label}
                                </Flex>
                            );
                        })}
                    </Stack>
                    <Box flex={1} minW={0} overflowY="auto" px={{ base: 4, md: 10 }} py={{ base: 6, md: 10 }}>
                        <ProfileContent tab={tab} onAccountDeleted={onClose} />
                    </Box>
                </Flex>
            </ModalContent>
        </Modal>
    );
};
