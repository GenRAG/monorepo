import { useState } from "react";
import { Box, HStack, Input, Skeleton, Text, VStack } from "@chakra-ui/react";
import { UserPlus, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import SectionHeader from "components/Deployment/SectionHeader";
import Button from "components/ui/Button";
import {
    useGetAgentMembersQuery,
    useAddAgentMemberMutation,
    useRemoveAgentMemberMutation,
} from "services/agent/agentMembers";
import useThemedToast from "hooks/useThemedToast";
import BoxIcon from "components/ui/BoxIcon";
import { getApiErrorMessage } from "utils/apiError";

const MemberRowSkeleton = () => {
    return (
        <HStack
            p={3}
            borderTop="1px solid"
            _first={{ borderTop: "none" }}
            borderTopColor="borderDefault"
            justify="space-between"
        >
            <HStack spacing={3} py={1}>
                <Skeleton w="36px" h="36px" borderRadius="8px" />
                <VStack align="start" spacing={1.5}>
                    <Skeleton h="10px" w="110px" borderRadius="4px" />
                    <Skeleton h="9px" w="150px" borderRadius="4px" />
                </VStack>
            </HStack>
            <Skeleton w="32px" h="32px" borderRadius="8px" />
        </HStack>
    );
};

export const MembersSection = () => {
    const { workspaceId = "", agentId = "" } = useParams<{ workspaceId: string; agentId: string }>();
    const [email, setEmail] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const toast = useThemedToast();

    const { data: members = [], isLoading } = useGetAgentMembersQuery(
        { workspaceId, agentId },
        { skip: !workspaceId || !agentId },
    );
    const [addMember, { isLoading: isAddingMember }] = useAddAgentMemberMutation();
    const [removeMember] = useRemoveAgentMemberMutation();

    const handleAdd = async () => {
        if (!email.trim()) return;
        try {
            await addMember({ workspaceId, agentId, email: email.trim() }).unwrap();
            setEmail("");
            setIsAdding(false);
            toast({ title: "Membre ajouté", status: "success", duration: 3000 });
        } catch (err: unknown) {
            toast({
                title: "Impossible d'ajouter ce membre",
                description: getApiErrorMessage(err) ?? "Une erreur est survenue",
                status: "error",
                duration: 4000,
            });
        }
    };

    const handleRemove = async (memberId: string, memberEmail: string) => {
        try {
            await removeMember({ workspaceId, agentId, memberId }).unwrap();
            toast({ title: `${memberEmail} retiré`, status: "success", duration: 3000 });
        } catch {
            toast({ title: "Erreur lors de la suppression", status: "error", duration: 3000 });
        }
    };

    return (
        <Box
            borderRadius="12px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="borderDefault"
            bg="surfacePrimary"
            w="100%"
        >
            <SectionHeader
                icon={UserPlus}
                title="Membres autorisés"
                subtitle={`${members.length} membre${members.length !== 1 ? "s" : ""}`}
                action={
                    <Button leftIcon={UserPlus} size="xs" onClick={() => setIsAdding((v) => !v)}>
                        Ajouter
                    </Button>
                }
            />

            {isAdding && (
                <HStack p={3} borderBottom="1px solid" borderColor="borderDefault" spacing={2}>
                    <Input
                        placeholder="Email de l'utilisateur"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        size="sm"
                        autoFocus
                    />
                    <Button size="sm" onClick={handleAdd} isLoading={isAddingMember}>
                        Confirmer
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setIsAdding(false);
                            setEmail("");
                        }}
                    >
                        Annuler
                    </Button>
                </HStack>
            )}

            {isLoading ? (
                <VStack spacing={0} align="stretch">
                    {[1, 2, 3].map((i) => (
                        <MemberRowSkeleton key={i} />
                    ))}
                </VStack>
            ) : members.length === 0 && !isAdding ? (
                <Text fontSize="sm" color="textFaint" p={4} textAlign="center">
                    Aucun membre invité pour l&apos;instant.
                </Text>
            ) : (
                <VStack spacing={0} align="stretch">
                    {members.map((m) => (
                        <HStack
                            key={m.id}
                            p={3}
                            borderTop="1px solid"
                            _first={{ borderTop: "none" }}
                            borderTopColor="borderDefault"
                            justify="space-between"
                        >
                            <HStack spacing={3} py={1}>
                                <BoxIcon letters={m.name?.slice(0, 2) || m.email.slice(0, 2)} />
                                <VStack align="start" spacing={0}>
                                    {m.name && (
                                        <Text variant="body-sm" fontWeight={500}>
                                            {m.name}
                                        </Text>
                                    )}
                                    <Text variant="body-xs" color="textLabel">
                                        {m.email}
                                    </Text>
                                </VStack>
                            </HStack>

                            <Button
                                icon={Trash2}
                                btnType="icon"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(m.id, m.email)}
                            />
                        </HStack>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default MembersSection;
