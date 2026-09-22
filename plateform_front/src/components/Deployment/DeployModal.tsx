import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Text,
} from "@chakra-ui/react";
import Button from "components/ui/Button";
import useThemedToast from "hooks/useThemedToast";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCreateDeploymentMutation } from "services/deployment/deployment";
import mixpanel from "lib/mixpanel";
import { getApiErrorMessage } from "utils/apiError";

interface DeployModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export const DeployModal = ({ isOpen, onClose, title = "Déployer en Production" }: DeployModalProps) => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();
    const [name, setName] = useState("");
    const [changelog, setChangelog] = useState("");
    const [deploy, { isLoading: isDeploying }] = useCreateDeploymentMutation();
    const toast = useThemedToast();

    const handleSubmit = async () => {
        try {
            const deployment = await deploy({ workspaceId, agentId, name, changelog }).unwrap();
            mixpanel.track("agent_deployed", { agent_id: agentId, deployment_version: deployment.version });
            toast({
                title: "Déploiement en cours",
                description: "Votre agent a été déployé avec succès.",
                status: "success",
            });
            onClose();
        } catch (err: unknown) {
            const isIncomplete = getApiErrorMessage(err) === "Workflow has unconfigured nodes";
            toast({
                title: isIncomplete ? "Workflow incomplet" : "Erreur",
                description: isIncomplete
                    ? "Configurez tous les modèles et instructions avant de déployer."
                    : "Une erreur est survenue lors du déploiement.",
                status: "error",
            });
        }
    };

    const handleClose = () => {
        setName("");
        setChangelog("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent
                bg="surfaceCard"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="borderDivider"
                borderRadius="14px"
            >
                <ModalHeader fontSize="2xl" fontWeight={600} color="textStrong" pb={1}>
                    {title}
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="sm" color="textMuted">
                            Cette version sera mise en production et accessible a vous et aux membres ajoutés
                        </Text>

                        <FormControl>
                            <FormLabel fontSize="12px" fontWeight={600} mb={1.5}>
                                Nom du déploiement
                            </FormLabel>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex : v1.2 — Nouveau prompt FAQ"
                                autoFocus
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="12px" fontWeight={600} mb={1.5}>
                                Description (optionnelle)
                            </FormLabel>
                            <Textarea
                                value={changelog}
                                onChange={(e) => setChangelog(e.target.value)}
                                placeholder="Décrivez les changements apportés…"
                                rows={3}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter gap={2}>
                    <Button size="sm" variant="outline" onClick={handleClose} isDisabled={isDeploying}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleSubmit} isLoading={isDeploying} isDisabled={!name.trim()}>
                        {title}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
