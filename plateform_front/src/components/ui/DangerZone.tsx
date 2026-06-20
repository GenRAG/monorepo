import { useRef, useState } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogOverlay,
    Box,
    Button,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";

interface DangerZoneProps {
    title: string;
    description: string;
    modalTitle: string;
    modalDescription: React.ReactNode;
    confirmText?: string;
    buttonLabel?: string;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

const DestructiveModal = ({
    isOpen,
    onClose,
    title,
    description,
    confirmText,
    onConfirm,
    isLoading,
}: Pick<DangerZoneProps, "onConfirm" | "isLoading" | "confirmText"> & {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: React.ReactNode;
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [typed, setTyped] = useState("");
    const isDisabled = confirmText ? typed !== confirmText : false;

    const handleClose = () => {
        setTyped("");
        onClose();
    };
    const handleConfirm = () => onConfirm().then(handleClose);

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={handleClose} isCentered>
            <AlertDialogOverlay backdropFilter="blur(2px)">
                <AlertDialogContent
                    bg="surfaceModal"
                    border="1.5px solid"
                    borderColor="rgba(239,68,68,0.2)"
                    borderRadius="16px"
                    overflow="hidden"
                >
                    <VStack
                        bg="rgba(239,68,68,0.06)"
                        borderBottom="1px solid"
                        borderColor="rgba(239,68,68,0.15)"
                        px={6}
                        py={5}
                        textAlign="center"
                    >
                        <BoxIcon icon={Trash2} bg="rgba(239,68,68,0.18)" color="red.500" />
                        <Text fontSize="md" fontWeight="700" color="red.500">
                            {title}
                        </Text>
                        <Text fontSize="xs" color="textLabel">
                            Cette action est irréversible
                        </Text>
                    </VStack>

                    <AlertDialogBody px={6} pt={4} pb={2}>
                        <VStack spacing={3} align="start">
                            <Text fontSize="sm" color="textSecondary" textAlign="center" w="100%">
                                {description}
                            </Text>
                            {confirmText && (
                                <>
                                    <Text fontSize="sm" color="textSecondary">
                                        Saisissez{" "}
                                        <Text as="span" fontWeight="700" color="textPrimary">
                                            {confirmText}
                                        </Text>{" "}
                                        pour confirmer.
                                    </Text>
                                    <Input
                                        size="sm"
                                        value={typed}
                                        onChange={(e) => setTyped(e.target.value)}
                                        placeholder={confirmText}
                                        borderRadius="8px"
                                        autoFocus
                                        _focus={{
                                            borderColor: "red.400",
                                            boxShadow: "0 0 0 1px var(--chakra-colors-red-400)",
                                        }}
                                    />
                                </>
                            )}
                        </VStack>
                    </AlertDialogBody>

                    <AlertDialogFooter gap={2} px={6} pb={5} pt={4}>
                        <Button ref={cancelRef} variant="ghost" size="sm" onClick={handleClose} flex={1}>
                            Annuler
                        </Button>
                        <Button
                            colorScheme="red"
                            variant="solid"
                            size="sm"
                            onClick={handleConfirm}
                            isLoading={isLoading}
                            isDisabled={isDisabled}
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

const DangerZone = ({
    title,
    description,
    modalTitle,
    modalDescription,
    confirmText,
    buttonLabel,
    onConfirm,
    isLoading,
}: DangerZoneProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Box
                border="2px solid"
                borderColor="rgba(239,68,68,0.2)"
                borderRadius="12px"
                overflow="hidden"
                bg="surfaceCard"
            >
                <HStack px={5} py={4} borderBottom="2px solid" borderColor="rgba(239,68,68,0.2)" spacing={2}>
                    <Icon as={AlertTriangle} boxSize={4} color="red.400" />
                    <Text fontSize="sm" fontWeight="600" color="red.400">
                        Zone de danger
                    </Text>
                </HStack>
                <HStack px={5} py={4} justify="space-between" flexWrap="wrap" gap={3}>
                    <VStack align="start" spacing={0.5}>
                        <Text fontSize="sm" fontWeight="500" color="textPrimary">
                            {title}
                        </Text>
                        <Text fontSize="xs" color="textLabel">
                            {description}
                        </Text>
                    </VStack>
                    <Button colorScheme="red" variant="solid" size="sm" onClick={() => setIsOpen(true)} flexShrink={0}>
                        {buttonLabel ?? title}
                    </Button>
                </HStack>
            </Box>

            <DestructiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={modalTitle}
                description={modalDescription}
                confirmText={confirmText}
                onConfirm={onConfirm}
                isLoading={isLoading}
            />
        </>
    );
};

export default DangerZone;
