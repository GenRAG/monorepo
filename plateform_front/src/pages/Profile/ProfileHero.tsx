import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { BadgeCheck } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";
import { User } from "types/user";

const Stat = ({ label, value }: { label: string; value: string }) => (
    <VStack align="start" spacing={0}>
        <Text variant="caption-xs-muted">{label}</Text>
        <Text variant="body-sm-semibold">{value}</Text>
    </VStack>
);

/** En-tête du profil, sur le modèle de celui d'une base de connaissances. */
const ProfileHero = ({ user }: { user: User }) => {
    const { data: workspaces } = useGetUserWorkspacesQuery();
    const initials = (user.name || user.email).slice(0, 2).toUpperCase();

    return (
        <VStack align="stretch" spacing={4}>
            <HStack align="center" spacing={4}>
                <BoxIcon letters={initials} size="lg" />
                <VStack align="start" spacing={0.5} minW={0}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textStrong" noOfLines={1}>
                        {user.name || user.email}
                    </Text>
                    <HStack spacing={1.5}>
                        <Text fontSize="sm" color="textLabel" noOfLines={1}>
                            {user.email}
                        </Text>
                        {user.isEmailVerified && (
                            <Icon as={BadgeCheck} boxSize={3.5} color="iconAccent" aria-label="Email vérifié" />
                        )}
                    </HStack>
                </VStack>
            </HStack>

            <HStack spacing={8}>
                <Stat label="Entreprise" value={workspaces?.[0]?.name ?? "—"} />
                <Stat
                    label="Membre depuis"
                    value={new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                    })}
                />
            </HStack>
        </VStack>
    );
};

export default ProfileHero;
