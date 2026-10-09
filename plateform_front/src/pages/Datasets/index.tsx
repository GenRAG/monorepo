import { useMemo, useState } from "react";
import { Center, HStack, Icon, Input, InputGroup, InputLeftElement, Text, VStack } from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { DatasetEmptyState } from "components/Dataset/Library/DatasetEmptyState";
import { DatasetGrid } from "components/Dataset/Library/DatasetGrid";
import { DatasetLibrarySkeleton } from "components/Dataset/Library/DatasetLibrarySkeleton";
import { DatasetTable } from "components/Dataset/Library/DatasetTable";
import { DatasetFormModal, DatasetFormValues } from "components/Dataset/Modals/DatasetFormModal";
import Button from "components/ui/Button";
import { MainLayoutContainer } from "components/ui/MainLayoutContainer";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { useDatasetActions } from "hooks/dataset/useDatasetActions";
import { ViewMode, useViewModePreference } from "hooks/dataset/useViewModePreference";
import useThemedToast from "hooks/useThemedToast";
import { useCreateDatasetMutation, useGetWorkspaceDatasetsQuery } from "services/dataset/dataset";
import { getApiErrorMessage } from "utils/apiError";

export const DatasetLibrary = () => {
    const { workspaceId = "" } = useParams<{ workspaceId: string }>();
    const toast = useThemedToast();
    const { data: datasets = [], isLoading, isError, refetch } = useGetWorkspaceDatasetsQuery(workspaceId);
    const [createDataset, { isLoading: isCreating }] = useCreateDatasetMutation();
    const [viewMode, setViewMode] = useViewModePreference("genrag.datasets.viewMode");
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { handleAction, modals } = useDatasetActions(workspaceId);

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query ? datasets.filter((d) => d.name.toLowerCase().includes(query)) : datasets;
    }, [datasets, search]);

    const handleCreate = async (values: DatasetFormValues) => {
        try {
            await createDataset({ workspaceId, ...values }).unwrap();
            setIsCreateOpen(false);
        } catch (error) {
            toast({
                title: "Création impossible",
                description: getApiErrorMessage(error) || "Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
        }
    };

    const openCreate = () => setIsCreateOpen(true);

    const renderBody = () => {
        if (isLoading) return <DatasetLibrarySkeleton viewMode={viewMode} />;
        if (isError) {
            return (
                <Center py={16} flexDirection="column" gap={3}>
                    <Text color="textError">Impossible de charger vos bases de connaissances.</Text>
                    <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                        Réessayer
                    </Button>
                </Center>
            );
        }
        if (datasets.length === 0) return <DatasetEmptyState onCreate={openCreate} />;
        if (visible.length === 0) {
            return (
                <Text variant="body-sm-muted" py={8} textAlign="center">
                    Aucune base ne correspond à « {search} ».
                </Text>
            );
        }
        return viewMode === "grid" ? (
            <DatasetGrid datasets={visible} onAction={handleAction} onCreate={search ? undefined : openCreate} />
        ) : (
            <DatasetTable datasets={visible} onAction={handleAction} />
        );
    };

    return (
        <MainLayoutContainer
            header={
                <VStack align="start" spacing={0.5}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textStrong">
                        Bases de connaissances
                    </Text>
                    <Text fontSize="sm" color="textLabel">
                        Regroupez vos documents dans des bases, puis choisissez les agents qui peuvent s&apos;en servir.
                    </Text>
                </VStack>
            }
            body={
                <>
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                        <InputGroup maxW="280px" size="sm">
                            <InputLeftElement pointerEvents="none">
                                <Icon as={Search} boxSize={4} color="textLabel" />
                            </InputLeftElement>
                            <Input
                                placeholder="Rechercher une base..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                        <HStack spacing={3}>
                            <MultiOptionButtons<ViewMode>
                                options={[
                                    { value: "grid", label: "Grille" },
                                    { value: "table", label: "Tableau" },
                                ]}
                                value={viewMode}
                                onChange={setViewMode}
                                size="sm"
                            />
                            <Button size="sm" variant="superPrimary" leftIcon={Plus} onClick={openCreate}>
                                Créer une base
                            </Button>
                        </HStack>
                    </HStack>

                    {renderBody()}

                    <DatasetFormModal
                        mode="create"
                        isOpen={isCreateOpen}
                        onClose={() => setIsCreateOpen(false)}
                        onSubmit={handleCreate}
                        isSubmitting={isCreating}
                    />
                    {modals}
                </>
            }
        />
    );
};
