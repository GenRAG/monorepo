import { useEffect, useState, type FormEvent } from "react";
import { Button, FormControl, FormLabel, Input, Text } from "@chakra-ui/react";
import { useGetUserWorkspacesQuery, useRenameWorkspaceMutation } from "services/workspace/workspace";
import useThemedToast from "hooks/useThemedToast";
import { WORKSPACE_NAME_MAX_LENGTH } from "types/workspace";
import { ProfileBlock } from "../ProfileBlock";

const OrganizationSection = () => {
    const toast = useThemedToast();
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
            await renameWorkspace({
                workspaceId: workspace.id,
                name: trimmed,
            }).unwrap();
            toast({ title: "Entreprise mise à jour", status: "success" });
        } catch {
            toast({ title: "Erreur lors de la mise à jour", status: "error" });
        }
    };

    return (
        <ProfileBlock
            title="Entreprise"
            subtitle="Ce nom s'affiche sur les assistants que vous partagez."
            onSubmit={(e) => void handleSubmit(e)}
            footer={
                <>
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
                </>
            }
        >
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
                        variant="glass"
                        size="sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={WORKSPACE_NAME_MAX_LENGTH}
                    />
                </FormControl>
            )}
        </ProfileBlock>
    );
};

export default OrganizationSection;
