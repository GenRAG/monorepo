import { useRef } from "react";
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
import { Trash2 } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import useThemedToast from "hooks/useThemedToast";
import { useDeleteDatasetMutation } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";
import { getApiErrorMessage } from "utils/apiError";
import { pluralize } from "utils/dataset/datasetStatus";

interface DeleteDatasetModalProps {
    dataset: DatasetEntity | null;
    workspaceId: string;
    onClose: () => void;
    onDeleted?: () => void;
}

export const DeleteDatasetModal = ({ dataset, workspaceId, onClose, onDeleted }: DeleteDatasetModalProps) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const toast = useThemedToast();
    const [deleteDataset, { isLoading }] = useDeleteDatasetMutation();

    const handleDelete = async () => {
        if (!dataset) return;
        try {
            await deleteDataset({ workspaceId, id: dataset.id }).unwrap();
        } catch (error) {
            toast({
                title: "Suppression impossible",
                description: getApiErrorMessage(error) || "La base n'a pas pu être supprimée. Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
            return;
        }
        onClose();
        onDeleted?.();
    };

    const agents = dataset?.agents ?? [];

    return (
        <AlertDialog isOpen={!!dataset} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
            <AlertDialogOverlay backdropFilter="blur(2px)">
                <AlertDialogContent
                    bg="surfaceCard"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="dangerBorder"
                    borderRadius="16px"
                    overflow="hidden"
                >
                    <VStack
                        bg="dangerBgSubtle"
                        borderBottomWidth="1px"
                        borderBottomStyle="solid"
                        borderBottomColor="dangerBorderSubtle"
                        px={6}
                        py={5}
                    >
                        <BoxIcon icon={Trash2} bg="dangerIconBg" color="red.500" />
                        <Text fontSize="md" fontWeight="700" color="red.500">
                            Supprimer la base
                        </Text>
                        <Text fontSize="xs" color="textLabel">
                            Cette action est irréversible
                        </Text>
                    </VStack>

                    <AlertDialogBody fontSize="sm" color="textLabel" px={6} pt={4} pb={2}>
                        <Text textAlign="center">
                            « {dataset?.name} » et ses {pluralize(dataset?.documentsCount ?? 0, "document")} seront
                            supprimés définitivement.
                        </Text>
                        {agents.length > 0 && (
                            <VStack align="stretch" spacing={1} mt={4} p={3} borderRadius="10px" bg="surfaceSubtle">
                                <Text variant="body-xs-semibold" color="textStrong">
                                    Ces agents ne pourront plus l&apos;utiliser :
                                </Text>
                                {agents.map((agent) => (
                                    <Text key={agent.id} variant="body-xs-muted">
                                        • {agent.name}
                                    </Text>
                                ))}
                            </VStack>
                        )}
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
                            isLoading={isLoading}
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
