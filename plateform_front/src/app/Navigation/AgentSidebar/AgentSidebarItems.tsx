import { Box, Icon, Text, Tooltip, useToken } from "@chakra-ui/react";
import { ChevronsLeft, ChevronsRight, LucideIcon } from "lucide-react";
import React, { type ComponentType, useState } from "react";
import { getGlassInk } from "components/ui/GlassNav";
import type { AnimatedIconProps } from "components/ui/GlassNav/icons";

interface AgentSidebarItemProps {
    icon: LucideIcon;
    /** Animated version of the icon, preferred when the item has one. */
    animatedIcon?: ComponentType<AnimatedIconProps>;
    label: string;
    active: boolean;
    isOpen: boolean;
    ink: ReturnType<typeof getGlassInk>;
    onClick: () => void;
}

// Contrairement à GlassNav (encre fixe "dark", posée sur son propre panneau glass toujours sombre
// quel que soit le colorMode), la sidebar agent est flush sur le fond ambiant partagé, qui lui suit
// le colorMode — l'encre doit donc suivre aussi. Reçue en prop plutôt que recalculée ici pour ne pas
// dupliquer la logique de bascule déjà faite dans AgentSidebar (source unique de vérité).
export const AgentSidebarItem: React.FC<AgentSidebarItemProps> = ({
    icon: ItemIcon,
    animatedIcon: AnimatedIcon,
    label,
    active,
    isOpen,
    ink,
    onClick,
}) => {
    const [activeColor] = useToken("colors", ["green.400"]);
    // Hover is tracked on the whole row so the icon animates when the pointer is anywhere on it.
    const [isHovered, setIsHovered] = useState(false);

    const row = (
        <Box
            as="button"
            type="button"
            aria-label={label}
            aria-current={active ? "page" : undefined}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
            {AnimatedIcon ? (
                <Box color={active ? activeColor : ink.muted} display="flex" flexShrink={0}>
                    <AnimatedIcon size={18} isActive={active} isHovered={isHovered} />
                </Box>
            ) : (
                <Icon as={ItemIcon} boxSize="18px" color={active ? activeColor : ink.muted} flexShrink={0} />
            )}
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

export const CollapseToggle: React.FC<CollapseToggleProps> = ({ isOpen, ink, onClick }) => (
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
