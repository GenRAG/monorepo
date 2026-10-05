import { useEffect, useState, type FormEvent } from "react";
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Stack,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { useGetUserWorkspacesQuery, useRenameWorkspaceMutation } from "services/workspace/workspace";
import useThemedToast from "hooks/useThemedToast";
import { WORKSPACE_NAME_MAX_LENGTH } from "types/workspace";

const OrganizationSection = () => {
    const toast = useThemedToast();
    const inputBg = useColorModeValue("white", "grey.900");
    const { data: workspaces, isLoading, isError } = useGetUserWorkspacesQuery();
    const [renameWorkspace, { isLoading: isSaving }] = useRenameWorkspaceMutation();
    const workspace = workspaces?.[0];
    const [name, setName] = useState(workspace?.name ?? "");

    useEffect(() => {
        setName(workspace?.name ?? "");
    }, [workspace?.name]);

    const trimmed = name.trim();
    const isUnchanged = trimmed === workspace?.name;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!workspace || !trimmed || isUnchanged) return;
        try {
            await renameWorkspace({ workspaceId: workspace.id, name: trimmed }).unwrap();
            toast({ title: "Entreprise mise à jour", status: "success" });
        } catch {
            toast({ title: "Erreur lors de la mise à jour", status: "error" });
        }
    };

    return (
        <VStack align="stretch" as="form" onSubmit={handleSubmit} w="100%">
            <Stack p={6} spacing={4}>
                <Box>
                    <Text fontSize="md" fontWeight="600" color="textPrimary">
                        Entreprise
                    </Text>
                    <Text fontSize="sm" color="textLabel" mt={0.5}>
                        Ce nom s&apos;affiche sur les assistants que vous partagez.
                    </Text>
                </Box>

                {isError || (!isLoading && !workspace) ? (
                    <Text fontSize="sm" color="textError">
                        Impossible de charger votre entreprise.
                    </Text>
                ) : (
                    <FormControl isDisabled={isLoading}>
                        <FormLabel fontSize="xs" color="textLabel">
                            Nom de l&apos;entreprise
                        </FormLabel>
                        <Input
                            bg={inputBg}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={WORKSPACE_NAME_MAX_LENGTH}
                        />
                    </FormControl>
                )}
            </Stack>

            <Divider borderColor="borderDefault" />

            <HStack justify="flex-end" spacing={3} p={6}>
                <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => setName(workspace?.name ?? "")}
                    isDisabled={isUnchanged}
                >
                    Annuler
                </Button>
                <Button
                    size="sm"
                    variant="superPrimary"
                    type="submit"
                    isLoading={isSaving}
                    isDisabled={!trimmed || isUnchanged}
                >
                    Enregistrer
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrganizationSection;
