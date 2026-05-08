import { Navigate, Outlet, useParams } from "react-router-dom";
import { useGetWorkspaceByIdQuery } from "services/workspace/workspace";
import { Spinner, Flex } from "@chakra-ui/react";
import NotFound from "pages/NotFound";

export default function WorkspaceGuard() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { isLoading, isError, error } = useGetWorkspaceByIdQuery(workspaceId!, {
        skip: !workspaceId,
    });

    if (isLoading) {
        return (
            <Flex h="100vh" align="center" justify="center">
                <Spinner size="lg" />
            </Flex>
        );
    }

    if (isError) {
        return <NotFound />;
    }

    return <Outlet />;
}
