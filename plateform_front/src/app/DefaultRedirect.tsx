import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGetUserWorkspacesQuery, useCreateWorkspaceMutation } from "services/workspace/workspace";
import { Spinner, Flex } from "@chakra-ui/react";
import { WelcomeScreen } from "components/Auth/WelcomeScreen";

export default function DefaultRedirect() {
    const navigate = useNavigate();
    const { data: workspaces, isLoading } = useGetUserWorkspacesQuery();
    const [createWorkspace] = useCreateWorkspaceMutation();
    const [isCreating, setIsCreating] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);

    const isNewUser = !isLoading && workspaces !== undefined && workspaces.length === 0;

    useEffect(() => {
        if (isLoading || workspaces === undefined || isCreating) return;
        if (workspaces.length === 0) {
            setIsCreating(true);
            setShowWelcome(true);
            void createWorkspace({ name: "Mon workspace" })
                .unwrap()
                .then((ws) => setPendingWorkspaceId(ws.id))
                .catch(() => {});
        }
    }, [isLoading, workspaces, createWorkspace, isCreating]);

    const handleWelcomeDone = useCallback(() => {
        if (pendingWorkspaceId) {
            void navigate(`/onboarding/${pendingWorkspaceId}`, { replace: true });
        }
    }, [pendingWorkspaceId, navigate]);

    if (showWelcome) {
        return <WelcomeScreen onDone={handleWelcomeDone} />;
    }

    if (isLoading || isCreating || !workspaces?.length) {
        return (
            <Flex h="100vh" align="center" justify="center">
                <Spinner size="lg" />
            </Flex>
        );
    }

    return <Navigate to={`/workspaces/${workspaces[0].id}/agents`} replace />;
}
