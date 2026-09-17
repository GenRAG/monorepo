import { Divider, HStack, Icon, Stack, Text, VStack } from "@chakra-ui/react";
import { MessageSquare, Scale, User, type LucideIcon } from "lucide-react";
import { ComponentProps, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "store";
import { setLastWorkspaceId } from "store/navigationSlice";
import BoxIcon from "components/ui/BoxIcon";
import { ActionMenu } from "components/ui/ActionMenu";
import { SidebarFooterPanel } from "app/Navigation/SidebarFooterPanel";

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

    if (!name && !email) return null;

    const displayName = (name || email) ?? "";
    const truncated = displayName.length > 16 ? displayName.slice(0, 16) + "…" : displayName;

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

    const footer = ({ onClose }: { onClose: () => void }) => <SidebarFooterPanel onClose={onClose} />;

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
