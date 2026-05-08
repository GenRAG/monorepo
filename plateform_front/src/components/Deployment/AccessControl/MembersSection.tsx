import {
    Avatar,
    Box,
    HStack,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { UserPlus, Trash2 } from "lucide-react";
import SectionHeader from "components/Deployment/SectionHeader";
import Button from "components/System/Atoms/Button";

const MEMBERS = [
    {
        initials: "LM",
        name: "Lucas Martin",
        email: "l.martin@company.com",
        role: "ADMIN" as const,
        since: "il y a 2 mois",
        color: "#6B46C1",
    },
    {
        initials: "TD",
        name: "Thomas Dupont",
        email: "t.dupont@company.com",
        role: "LECTEUR" as const,
        since: "il y a 3 mois",
        color: "#3182CE",
    },
    {
        initials: "PA",
        name: "Pierre Antoine",
        email: "p.antoine@company.com",
        role: "LECTEUR" as const,
        since: "il y a 1 mois",
        color: "#ED8936",
    },
    {
        initials: "AF",
        name: "Alice Ferrand",
        email: "a.ferrand@company.com",
        role: "ADMIN" as const,
        since: "il y a 5 mois",
        color: "#38A169",
    },
];

export const MembersSection = () => {
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const containerBg = useColorModeValue("white", "grey.950");
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textMuted = useColorModeValue("grey.300", "grey.500");
    const textHint = useColorModeValue("grey.200", "grey.700");
    const avatarBg = useColorModeValue("grey.200", "grey.700");

    return (
        <Box
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            bg={containerBg}
        >
            <SectionHeader
                title="Membres autorisés"
                subtitle={`${MEMBERS.length} membres`}
                action={
                    <Button
                        leftIcon={UserPlus}
                        size="sm"
                        onClick={() => alert("Ajouter un membre")}
                    >
                        Ajouter
                    </Button>
                }
            />
            <VStack spacing={0} align="stretch">
                {MEMBERS.map((m) => (
                    <HStack
                        key={m.email}
                        p={3}
                        borderTop="1px solid"
                        borderTopColor={borderColor}
                        justify="space-between"
                    >
                        <HStack spacing={3} py={2}>
                            <Avatar
                                size="xs"
                                name={m.name}
                                bg={avatarBg}
                                color="grey.50"
                            />
                            <VStack align="start" spacing={0}>
                                <Text
                                    fontSize="sm"
                                    fontWeight={500}
                                    color={textPrimary}
                                >
                                    {m.name}
                                </Text>
                                <Text fontSize="sm" color={textMuted}>
                                    {m.email}
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack spacing={3}>
                            <Text fontSize="11px" color={textHint}>
                                {m.since}
                            </Text>
                            <Button
                                icon={Trash2}
                                btnType="icon"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    alert(
                                        `Supprimer ${m.name} de la liste blanche`,
                                    )
                                }
                            />
                        </HStack>
                    </HStack>
                ))}
            </VStack>
        </Box>
    );
};

export default MembersSection;
