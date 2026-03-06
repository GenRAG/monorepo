import {
    Heading,
    Stack,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { WorkspaceCard } from "pages/Workspace/WorkspaceCard";
import { WorkspacePreview } from "types/workspace";

export const Workspaces = () => {
    const { colorMode } = useColorMode();
    //const { data: workspaces = [], isLoading } = useGetUserWorkspacesQuery();
    const textPrimary = useColorModeValue("grey.950", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const mockWorkspaces: WorkspacePreview[] = [
        {
            id: "1",
            name: "Workspace 1",
            documentsCount: 10,
            updatedAt: new Date().toISOString(),
        },
    ];

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={8} overflow="auto" maxH="100vh">
            <VStack align="stretch" spacing={2}>
                <Heading
                    variant="heading-md"
                    color={colorMode === "dark" ? "grey.400" : "grey.400"}
                    fontWeight="md"
                    fontSize={{ base: "sm", md: "md" }}
                >
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </Heading>
                <Heading
                    variant="heading-3xl"
                    color={textPrimary}
                    fontWeight="semibold"
                    fontSize={{ base: "xl", md: "3xl" }}
                >
                    Workspaces
                </Heading>
                <Text color={textSecondary} variant="body-md">
                    Manage your workspaces here.
                </Text>
            </VStack>

            {/*isLoading ? (
                <Text color={textSecondary}>Chargement...</Text>
            ) : workspaces.length === 0 ? (
                <Text color={textSecondary}>
                    Aucun workspace. Créez-en un pour commencer.
                </Text>
            ) : (*/}
            <VStack align="stretch" spacing={4}>
                {mockWorkspaces.map((workspace) => (
                    <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))}
            </VStack>
            {/*)}*/}
        </Stack>
    );
};
