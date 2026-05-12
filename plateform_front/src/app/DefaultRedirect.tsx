import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    useGetUserWorkspacesQuery,
    useCreateWorkspaceMutation,
} from "services/workspace/workspace";
import { Spinner, Flex } from "@chakra-ui/react";

export default function DefaultRedirect() {
    const navigate = useNavigate();
    const { data: workspaces, isLoading } = useGetUserWorkspacesQuery();
    const [createWorkspace] = useCreateWorkspaceMutation();
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isLoading || workspaces === undefined || isCreating) return;
        if (workspaces.length === 0) {
            setIsCreating(true);
            void createWorkspace({ name: "Mon workspace" })
                .unwrap()
                .then((ws) =>
                    navigate(`/onboarding/${ws.id}`, { replace: true }),
                )
                .catch(console.error);
        }
    }, [isLoading, workspaces, createWorkspace, navigate, isCreating]);

    if (isLoading || isCreating || !workspaces?.length) {
        return (
            <Flex h="100vh" align="center" justify="center">
                <Spinner size="lg" />
            </Flex>
        );
    }

    return <Navigate to={`/workspaces/${workspaces[0].id}/agents`} replace />;
}
