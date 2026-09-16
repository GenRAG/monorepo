import { Box, HStack, Icon, Text, Tooltip, useDisclosure, useToken, VStack, Stack } from "@chakra-ui/react";
import { ChevronsLeft, ChevronsRight, LucideIcon } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { agentNavItems, agentNavSections } from "app/Navigation/sidebarConfig";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import BoxIcon from "components/ui/BoxIcon";
import { getGlassInk, GlassSurface } from "components/ui/GlassNav";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useUserInfo } from "hooks/useUserInfo";
import { useGetAgentByIdQuery } from "services/agent/agent";
import { getAgentAvatar } from "utils/agentAvatar";

const EXPANDED_WIDTH = "236px";
const COLLAPSED_WIDTH = "76px";

interface AgentSidebarItemProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    isOpen: boolean;
    onClick: () => void;
}

// Même logique que GlassNav (encre fixe dérivée de la surface plutôt que du colorMode, tooltip
// quand replié), déclinée en ligne pleine largeur plutôt qu'en badge — la sidebar agent a des
// sections avec labels, pas juste une liste plate d'icônes.
const AgentSidebarItem: React.FC<AgentSidebarItemProps> = ({ icon: ItemIcon, label, active, isOpen, onClick }) => {
    const ink = getGlassInk("dark");
    const [activeColor] = useToken("colors", ["green.400"]);

    const row = (
        <Box
            as="button"
            type="button"
            aria-label={label}
            aria-current={active ? "page" : undefined}
            onClick={onClick}
            display="flex"
            alignItems="center"
            justifyContent={isOpen ? "flex-start" : "center"}
            gap={3}
            w="100%"
            px={isOpen ? 3 : 0}
            py="10px"
            borderRadius="12px"
            bg={active ? ink.pillBg : "transparent"}
            cursor="pointer"
            border="none"
            outline="none"
            transition="background 0.15s"
            _hover={{ bg: ink.pillBg }}
        >
            <Icon as={ItemIcon} boxSize="18px" color={active ? activeColor : ink.muted} flexShrink={0} />
            {isOpen && (
                <Text fontSize="sm" fontWeight={active ? 600 : 500} color={active ? ink.text : ink.muted} noOfLines={1}>
                    {label}
                </Text>
            )}
        </Box>
    );

    if (isOpen) return row;

    return (
        <Tooltip placement="right" color="white" borderRadius="8px" hasArrow bg="tooltipBg" label={label}>
            {row}
        </Tooltip>
    );
};

interface CollapseToggleProps {
    isOpen: boolean;
    ink: ReturnType<typeof getGlassInk>;
    onClick: () => void;
}

const CollapseToggle: React.FC<CollapseToggleProps> = ({ isOpen, ink, onClick }) => (
    <Tooltip
        placement="right"
        color="white"
        borderRadius="8px"
        hasArrow
        bg="tooltipBg"
        label={isOpen ? "Réduire" : "Agrandir"}
    >
        <Box
            as="button"
            type="button"
            aria-label={isOpen ? "Réduire la sidebar" : "Agrandir la sidebar"}
            onClick={onClick}
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="28px"
            h="28px"
            borderRadius="full"
            bg={ink.pillBg}
            color={ink.muted}
            flexShrink={0}
            border="none"
            cursor="pointer"
            transition="color 0.15s"
            _hover={{ color: ink.text }}
        >
            {isOpen ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
        </Box>
    </Tooltip>
);

/**
 * Sidebar agent en verre dépoli — même matériau que la nav principale (`GlassSurface`), mais
 * toujours en colonne flottante (jamais en bottom bar : ce contexte n'a pas d'équivalent
 * "orientation horizontale"). Repliable en rail d'icônes façon GlassNav plutôt qu'en Drawer
 * plein écran sur mobile : un seul panneau, une seule largeur qui s'anime, sur tous les
 * breakpoints — replié par défaut sur mobile via `defaultIsOpen`.
 */
const AgentSidebar = () => {
    const navigate = useNavigate();

    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { data: agent } = useGetAgentByIdQuery({ workspaceId, id: agentId }, { skip: !workspaceId || !agentId });
    const { name, email } = useUserInfo();

    const isMobile = useAppResponsive({ base: true, lg: false });
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !isMobile });

    const activePath = useActiveSidebarItem(agentNavItems.map((i) => i.id));
    const ink = getGlassInk("dark");
    const avatarStyle = getAgentAvatar(agent?.name ?? "");

    const handleItemClick = async (id: string) => {
        if (workspaceId && agentId) {
            await navigate(`/workspaces/${workspaceId}/agents/${agentId}/${id}`);
        }
    };

    const handleBackToDashboard = async () => {
        await navigate(`/workspaces/${workspaceId}/dashboard`);
    };

    const footerTrigger = (
        <HStack
            w="100%"
            spacing={3}
            justify={isOpen ? "flex-start" : "center"}
            px={isOpen ? 3 : 0}
            py="10px"
            borderRadius="12px"
            cursor="pointer"
            transition="background 0.15s"
            _hover={{ bg: ink.pillBg }}
        >
            <BoxIcon size="sm" letters={name?.slice(0, 2) || email?.slice(0, 2)} />
            {isOpen && (
                <VStack align="start" spacing={0} minW={0} flex={1}>
                    <Text fontSize="sm" color={ink.text} noOfLines={1}>
                        {name || email}
                    </Text>
                    {email && (
                        <Text fontSize="xs" color={ink.muted} noOfLines={1}>
                            {email}
                        </Text>
                    )}
                </VStack>
            )}
        </HStack>
    );

    return (
        <Box p={3} h="100vh" flexShrink={0}>
            <GlassSurface
                variant="dark"
                h="100%"
                w={isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH}
                borderRadius="24px"
                px={4}
                py={3}
                display="flex"
                flexDirection="column"
                transition="width 0.25s ease"
            >
                <HStack justify="space-between" align="center" mb={3} px={isOpen ? 1 : 0}>
                    <HStack spacing={2} minW={0} flex={1} justify={isOpen ? "flex-start" : "center"}>
                        <BoxIcon
                            size="sm"
                            letters={(agent?.name ?? "A").charAt(0).toUpperCase()}
                            color={avatarStyle.color}
                            bg={avatarStyle.bg}
                        />
                        {isOpen && (
                            <Text fontSize="xs" fontWeight="700" letterSpacing="0.5px" color={ink.text} noOfLines={1}>
                                {agent?.name?.toUpperCase() ?? ""}
                            </Text>
                        )}
                    </HStack>
                    {isOpen && <CollapseToggle isOpen={isOpen} ink={ink} onClick={onToggle} />}
                </HStack>

                {!isOpen && (
                    <Box mx="auto" mb={3}>
                        <CollapseToggle isOpen={isOpen} ink={ink} onClick={onToggle} />
                    </Box>
                )}

                <Box h="1px" bg="rgba(255, 255, 255, 0.1)" mb={3} flexShrink={0} />

                <VStack align="stretch" spacing={1} flex={1} minH={0} overflow="auto">
                    {agentNavSections.map((section, i) => (
                        <Box key={section.label}>
                            {i > 0 && <Box h={3} />}
                            {isOpen && (
                                <Text
                                    fontSize="9px"
                                    fontWeight="700"
                                    letterSpacing="0.1em"
                                    textTransform="uppercase"
                                    color={ink.muted}
                                    px={3}
                                    pb={1}
                                >
                                    {section.label}
                                </Text>
                            )}
                            <Stack spacing={1}>
                                {section.items.map(({ id, icon, label }) => (
                                    <AgentSidebarItem
                                        key={id}
                                        icon={icon}
                                        label={label}
                                        active={activePath === id}
                                        isOpen={isOpen}
                                        onClick={() =>
                                            void (id === "retour" ? handleBackToDashboard() : handleItemClick(id))
                                        }
                                    />
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </VStack>

                <Box mt={2} flexShrink={0}>
                    <SidebarFooter
                        isOpen={isOpen}
                        activeItem={activePath ?? ""}
                        name={name}
                        email={email}
                        supportMenu={[]}
                        compactTrigger={footerTrigger}
                        compactPlacement="right-start"
                    />
                </Box>
            </GlassSurface>
        </Box>
    );
};

export default AgentSidebar;
