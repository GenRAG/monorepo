import { Navigate, Outlet, useParams } from "react-router-dom";
import { useGetWorkspaceByIdQuery } from "services/workspace/workspace";
import { useGetOnboardingSessionQuery } from "services/onboarding/onboarding";
import { Spinner, Flex } from "@chakra-ui/react";
import NotFound from "pages/NotFound";

export default function WorkspaceGuard() {
    const { workspaceId } = useParams<{ workspaceId: string }>();

    const { isLoading, isError } = useGetWorkspaceByIdQuery(workspaceId!, {
        skip: !workspaceId,
    });

    const { data: onboardingSession, isLoading: isOnboardingLoading } =
        useGetOnboardingSessionQuery(workspaceId!, { skip: !workspaceId });

    if (isLoading || isOnboardingLoading) {
        return (
            <Flex h="100vh" align="center" justify="center">
                <Spinner size="lg" />
            </Flex>
        );
    }

    if (isError) {
        return <NotFound />;
    }

    if (onboardingSession && !onboardingSession.completed) {
        return <Navigate to={`/onboarding/${workspaceId}`} replace />;
    }

    return <Outlet />;
}
