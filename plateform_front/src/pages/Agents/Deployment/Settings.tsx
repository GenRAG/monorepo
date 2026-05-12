import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    HStack,
    Icon,
    Text,
    useColorModeValue,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import DataPrivacy from "components/Deployment/Settings/DataPrivacy";
import HostingRegion from "components/Deployment/Settings/HostingRegion";
import RGPDBanner from "components/Deployment/Settings/RGPDBanner";
import { UserRights } from "components/Deployment/Settings/UserRights";
import { useIsDark } from "hooks/useIsDark";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteAgentMutation, useGetAgentByIdQuery } from "services/agent/agent";
import { AlertTriangle } from "lucide-react";

const DangerZone = () => {
    const { workspaceId = "", agentId = "" } = useParams<{ workspaceId: string; agentId: string }>();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [deleteAgent, { isLoading: isDeleting }] = useDeleteAgentMutation();
    const { data: agent } = useGetAgentByIdQuery({ workspaceId, id: agentId }, { skip: !agentId });

    const border = useColorModeValue("red.100", "rgba(239,68,68,0.2)");
    const cardBg = useColorModeValue("white", "grey.900");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const descColor = useColorModeValue("grey.500", "grey.400");

    const handleDelete = async () => {
        await deleteAgent({ workspaceId, id: agentId });
        onClose();
        await navigate(`/workspaces/${workspaceId}/agents`);
    };

    return (
        <>
            <Box border="1px solid" borderColor={border} borderRadius="12px" overflow="hidden" bg={cardBg}>
                <HStack px={5} py={4} borderBottom="1px solid" borderColor={border} spacing={2}>
                    <Icon as={AlertTriangle} boxSize={4} color="red.400" />
                    <Text fontSize="sm" fontWeight="600" color="red.400">
                        Zone de danger
                    </Text>
                </HStack>
                <HStack px={5} py={4} justify="space-between" flexWrap="wrap" gap={3}>
                    <VStack align="start" spacing={0.5}>
                        <Text fontSize="sm" fontWeight="500" color={titleColor}>
                            Supprimer cet agent
                        </Text>
                        <Text fontSize="xs" color={descColor}>
                            Supprime définitivement l&apos;agent, ses documents, conversations et workflows.
                        </Text>
                    </VStack>
                    <Button colorScheme="red" size="sm" onClick={onOpen} flexShrink={0}>
                        Supprimer l&apos;agent
                    </Button>
                </HStack>
            </Box>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent
                        bg={useColorModeValue("white", "grey.900")}
                        border="1px solid"
                        borderColor={useColorModeValue("grey.200", "grey.700")}
                        borderRadius="14px"
                    >
                        <AlertDialogHeader fontSize="md" fontWeight="600" color={titleColor}>
                            Supprimer l&apos;agent
                        </AlertDialogHeader>
                        <AlertDialogBody fontSize="sm" color={descColor}>
                            Voulez-vous vraiment supprimer <strong>{agent?.name ?? "cet agent"}</strong> ? Cette action
                            est irréversible — toutes les conversations, documents et workflows associés seront
                            supprimés.
                        </AlertDialogBody>
                        <AlertDialogFooter gap={2}>
                            <Button ref={cancelRef} variant="ghost" size="sm" onClick={onClose}>
                                Annuler
                            </Button>
                            <Button colorScheme="red" size="sm" onClick={handleDelete} isLoading={isDeleting}>
                                Supprimer définitivement
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export const Settings = () => {
    const isDark = useIsDark();

    return (
        <Box flex={1} overflowY="auto" p={6} bg={isDark ? "grey.975" : "white"}>
            <VStack spacing={5} align="stretch" maxW="820px" mx="auto">
                <RGPDBanner />
                <HostingRegion />
                <DataPrivacy />
                <UserRights />
                <DangerZone />
            </VStack>
        </Box>
    );
};
