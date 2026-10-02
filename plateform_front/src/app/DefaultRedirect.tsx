import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGetUserWorkspacesQuery, useCreateWorkspaceMutation } from "services/workspace/workspace";
import { WelcomeScreen } from "components/Auth/WelcomeScreen";
import { AppLoader } from "components/ui/AppLoader";
import useThemedToast from "hooks/useThemedToast";
import { DEFAULT_WORKSPACE_NAME } from "types/workspace";

export default function DefaultRedirect() {
    const navigate = useNavigate();
    const toast = useThemedToast();
    const { data: workspaces, isLoading } = useGetUserWorkspacesQuery();
    const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        if (!isLoading && workspaces?.length === 0) setShowWelcome(true);
    }, [isLoading, workspaces]);

    const handleStart = async (organizationName: string) => {
        try {
            const workspace = await createWorkspace({
                name: organizationName.trim() || DEFAULT_WORKSPACE_NAME,
            }).unwrap();
            void navigate(`/onboarding/${workspace.id}`, { replace: true });
        } catch {
            toast({
                title: "Impossible de créer votre espace",
                description: "Réessayez dans un instant.",
                status: "error",
            });
        }
    };

    if (showWelcome) {
        return <WelcomeScreen onDone={handleStart} isSubmitting={isCreating} />;
    }

    if (isLoading || !workspaces?.length) {
        return <AppLoader message="Chargement de votre espace..." />;
    }

    return <Navigate to={`/workspaces/${workspaces[0].id}/agents`} replace />;
}
