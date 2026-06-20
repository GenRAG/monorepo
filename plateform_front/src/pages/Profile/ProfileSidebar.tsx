import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Shield, User } from "lucide-react";

export type ProfileSection = "info" | "security" | "sessions" | "workspaces" | "linked" | "notifications";

const NAV_ITEMS: { id: ProfileSection; label: string; icon: any }[] = [
    { id: "info", label: "Informations", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
];

const NavItem = ({
    item,
    isActive,
    onClick,
}: {
    item: (typeof NAV_ITEMS)[0];
    isActive: boolean;
    onClick: () => void;
}) => (
    <HStack
        as="button"
        w="100%"
        spacing={2.5}
        p={3}
        borderRadius="4px"
        cursor="pointer"
        bg={isActive ? "surfaceHover" : "transparent"}
        color={isActive ? "textPrimary" : "textLabel"}
        _hover={{ bg: "surfaceHover", color: "textPrimary" }}
        transition="all 0.12s"
        onClick={onClick}
        textAlign="left"
    >
        <Icon as={item.icon} boxSize={3.5} flexShrink={0} />
        <Text fontSize="sm" fontWeight={isActive ? "600" : "400"}>
            {item.label}
        </Text>
    </HStack>
);

interface ProfileSidebarProps {
    activeSection: ProfileSection;
    onSectionChange: (s: ProfileSection) => void;
}

const ProfileSidebar = ({ activeSection, onSectionChange }: ProfileSidebarProps) => (
    <VStack
        align="stretch"
        bg="surfaceCard"
        spacing={0}
        py={5}
        px={3}
        borderRight="1px solid"
        borderColor="borderDefault"
        minH="100%"
    >
        <Text fontSize="12px" color="textMuted" px={3} mb={2}>
            Paramètres
        </Text>

        <VStack align="stretch" spacing={0.5} flex={1}>
            {NAV_ITEMS.map((item) => (
                <NavItem
                    key={item.id}
                    item={item}
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                />
            ))}
        </VStack>
    </VStack>
);

export default ProfileSidebar;
