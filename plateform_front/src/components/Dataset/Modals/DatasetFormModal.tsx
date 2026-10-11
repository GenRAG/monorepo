import { FormEvent, useEffect, useState } from "react";
import {
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Textarea,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import Button from "components/ui/Button";

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

export interface DatasetFormValues {
    name: string;
    description: string;
}

interface DatasetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: DatasetFormValues) => Promise<void>;
    isSubmitting: boolean;
    mode: "create" | "edit";
    initialValues?: Partial<DatasetFormValues>;
}

export const DatasetFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    mode,
    initialValues,
}: DatasetFormModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const overlayBg = useColorModeValue("whiteAlpha.600", "blackAlpha.400");

    useEffect(() => {
        if (!isOpen) return;
        setName(initialValues?.name ?? "");
        setDescription(initialValues?.description ?? "");
    }, [isOpen, initialValues?.name, initialValues?.description]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        await onSubmit({ name: name.trim(), description: description.trim() });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay bg={overlayBg} />
            <ModalContent
                borderRadius="16px"
                overflow="hidden"
                bg="transparent"
                backdropFilter="blur(20px)"
                as="form"
                onSubmit={handleSubmit}
            >
                <ModalHeader>{mode === "create" ? "Créer une base de connaissances" : "Modifier la base"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm">Nom</FormLabel>
                            <Input
                                autoFocus
                                size="sm"
                                value={name}
                                maxLength={NAME_MAX_LENGTH}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex. : Procédures RH"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Description</FormLabel>
                            <Textarea
                                size="sm"
                                rows={3}
                                value={description}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ce que contient cette base, en une phrase"
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button size="sm" variant="ghost" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button
                        size="sm"
                        variant="superPrimary"
                        type="submit"
                        isLoading={isSubmitting}
                        isDisabled={!name.trim()}
                    >
                        {mode === "create" ? "Créer" : "Enregistrer"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
