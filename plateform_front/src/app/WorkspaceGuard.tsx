import { Outlet, useParams } from "react-router-dom";
import { useGetWorkspaceByIdQuery } from "services/workspace/workspace";
import { useGetOnboardingSessionQuery } from "services/onboarding/onboarding";
import { AppLoader } from "components/ui/AppLoader";
import NotFound from "pages/NotFound";

export default function WorkspaceGuard() {
    const { workspaceId } = useParams<{ workspaceId: string }>();

    const { isLoading, isError } = useGetWorkspaceByIdQuery(workspaceId!, {
        skip: !workspaceId,
    });

    const { data: onboardingSession, isLoading: isOnboardingLoading } = useGetOnboardingSessionQuery(workspaceId!, {
        skip: !workspaceId,
    });

    if (isLoading || isOnboardingLoading) {
        return <AppLoader message="Chargement de votre espace..." />;
    }

    if (isError) {
        return <NotFound />;
    }

    /*if (onboardingSession && !onboardingSession.completed) {
        return <Navigate to={`/onboarding/${workspaceId}`} replace />;
    }*/

    return <Outlet />;
}
