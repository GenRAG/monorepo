import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogOverlay,
    Button,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { useDeleteAgentMutation } from "services/agent/agent";
import BoxIcon from "components/ui/BoxIcon";
import mixpanel from "lib/mixpanel";

interface DeleteAgentModalProps {
    agentId: string;
    workspaceId: string;
    agentName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const DeleteAgentModal: React.FC<DeleteAgentModalProps> = ({
    agentId,
    workspaceId,
    agentName,
    isOpen,
    onClose,
    onSuccess,
}: DeleteAgentModalProps) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [deleteAgent, { isLoading: isDeleting }] = useDeleteAgentMutation();

    const handleDelete = async () => {
        await deleteAgent({ workspaceId, id: agentId });
        mixpanel.track("agent_deleted", { agent_id: agentId });
        onClose();
        onSuccess?.();
    };

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
            <AlertDialogOverlay backdropFilter="blur(2px)">
                <AlertDialogContent
                    bg="surfaceCard"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="dangerBorder"
                    borderRadius="16px"
                    overflow="hidden"
                    boxShadow="0 20px 60px rgba(239,68,68,0.15), 0 4px 16px rgba(0,0,0,0.12)"
                >
                    <VStack
                        bg="dangerBgSubtle"
                        borderBottom="1px solid"
                        borderColor="dangerBorderSubtle"
                        px={6}
                        py={5}
                        textAlign="center"
                        justifyContent="center"
                    >
                        <BoxIcon icon={Trash2} bg="dangerIconBg" color="red.500" />
                        <Text fontSize="md" fontWeight="700" color="red.500">
                            Supprimer l&apos;agent
                        </Text>
                        <Text fontSize="xs" color="textLabel" mt={0.5}>
                            Cette action est irréversible
                        </Text>
                    </VStack>

                    <AlertDialogBody fontSize="sm" color="textLabel" px={6} pt={4} pb={2} textAlign="center">
                        Voulez-vous vraiment supprimer{" "}
                        <Text as="span" fontWeight="600" color="textStrong">
                            {agentName}
                        </Text>{" "}
                        ? Toutes les conversations, documents et workflows associés seront supprimés définitivement.
                    </AlertDialogBody>

                    <AlertDialogFooter gap={2} px={6} pb={5} pt={4}>
                        <Button ref={cancelRef} variant="ghost" size="sm" onClick={onClose} flex={1}>
                            Annuler
                        </Button>
                        <Button
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            flex={1}
                        >
                            Supprimer définitivement
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};
