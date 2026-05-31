import { useEffect } from "react";
import { useColorModeValue } from "@chakra-ui/react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import Banner from "components/System/Atoms/Banner";

import type { Task, AppNodeData } from "@genrag/workflow";

const DocumentSettingsTab = ({ nodeData }: { task: Task; nodeData: AppNodeData }) => {
    const { reset } = useForm<Record<string, string>>({
        defaultValues: nodeData.inputs ?? {},
    });

    const navigate = useNavigate();
    const { workspaceId, agentId } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    useEffect(() => {
        if (nodeData) {
            reset(nodeData.inputs ?? {});
        }
    }, [nodeData, reset]);

    const labelColor = useColorModeValue("grey.600", "grey.200");

    return (
        <VStack flex={1} p={4} spacing={4} align="stretch" overflowY="auto">
            <Box>
                <HStack justify="space-between" mb={2}>
                    <Text fontSize="md" fontWeight="semibold">
                        Paramètres actuels
                    </Text>
                </HStack>
                <VStack spacing={2} align="stretch">
                    <Text fontSize="sm" color={labelColor}>
                        <strong>Type :</strong> Base de données vectoriel
                    </Text>
                    <Text fontSize="sm" color={labelColor}>
                        <strong>Fournisseur :</strong> Qdrant
                    </Text>
                    <Text fontSize="sm" color={labelColor}>
                        <strong>Documents :</strong> 120
                    </Text>
                </VStack>
            </Box>
            <Banner variant="green" mb="16px" flexShrink={0} gap="0">
                <HStack spacing={1}>
                    <Text fontSize="sm">Vous pouvez gérer vos documents</Text>
                    <Text
                        fontSize="sm"
                        _hover={{ textDecoration: "underline" }}
                        onClick={async () => {
                            await navigate(
                                workspaceId && agentId ? `/workspaces/${workspaceId}/agents/${agentId}/documents` : "#",
                            );
                        }}
                        cursor="pointer"
                        color="green.500"
                    >
                        ici
                    </Text>
                </HStack>
            </Banner>
        </VStack>
    );
};

export default DocumentSettingsTab;
