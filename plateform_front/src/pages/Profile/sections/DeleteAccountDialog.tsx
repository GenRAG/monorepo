import { useRef, useState } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

const DeleteAccountDialog = ({ isOpen, onClose, userEmail, onConfirm, isLoading }: Props) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [confirmEmail, setConfirmEmail] = useState("");

    const handleClose = () => {
        setConfirmEmail("");
        onClose();
    };

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={handleClose} isCentered>
            <AlertDialogOverlay backdropFilter="blur(4px)">
                <AlertDialogContent
                    bg="surfaceModal"
                    border="1px solid"
                    borderColor="borderDefault"
                    borderRadius="16px"
                    mx={4}
                    overflow="hidden"
                >
                    <Box h="3px" bg="red.400" w="100%" />
                    <AlertDialogHeader fontSize="md" fontWeight="600" pt={4} pb={1} color="textPrimary">
                        Supprimer le compte
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <VStack align="start" spacing={3}>
                            <Text fontSize="sm" color="textSecondary" lineHeight="1.6">
                                Cette action est irréversible. Tous vos workspaces, agents et documents seront
                                définitivement supprimés.
                            </Text>
                            <Text fontSize="sm" color="textSecondary">
                                Saisissez{" "}
                                <Text as="span" fontWeight="700" color="textPrimary">
                                    {userEmail}
                                </Text>{" "}
                                pour confirmer.
                            </Text>
                            <Input
                                size="sm"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                                placeholder={userEmail}
                                borderRadius="8px"
                                autoFocus
                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                            />
                        </VStack>
                    </AlertDialogBody>

                    <AlertDialogFooter gap={2} pt={4}>
                        <Button ref={cancelRef} size="sm" variant="ghost" onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="red"
                            onClick={onConfirm}
                            isLoading={isLoading}
                            isDisabled={confirmEmail !== userEmail}
                            borderRadius="8px"
                        >
                            Supprimer définitivement
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default DeleteAccountDialog;
