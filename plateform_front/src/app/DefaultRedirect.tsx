import { Navigate } from "react-router-dom";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";
import { Spinner, Flex } from "@chakra-ui/react";

export default function DefaultRedirect() {
    const { data: workspaces, isLoading } = useGetUserWorkspacesQuery();

    if (isLoading) {
        return (
            <Flex h="100vh" align="center" justify="center">
                <Spinner size="lg" />
            </Flex>
        );
    }

    if (!workspaces?.length) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Navigate to={`/workspaces/${workspaces[0].id}/agents`} replace />;
}
