import { useDisclosure } from "@chakra-ui/react";
import { DeployModal } from "components/Deployment/DeployModal";
import { AgentStatus, CurrentDeployment } from "types/deployment/deployment";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import HeaderCardEmpty from "components/Deployment/DashboardTab/HeaderCard/HeaderCardEmpty";
import HeaderCardMain from "components/Deployment/DashboardTab/HeaderCard/HeaderCardMain";
import { useStopDeploymentMutation } from "services/deployment/deployment";
import useThemedToast from "hooks/useThemedToast";
import { usePostHog } from "@posthog/react";

interface HeaderCardProps {
    data: CurrentDeployment;
    isLoading: boolean;
}

export const HeaderCard = ({ data, isLoading }: HeaderCardProps) => {
    const { workspaceId = "", agentId = "" } = useParams<{ workspaceId: string; agentId: string }>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const posthog = usePostHog();
    const toast = useThemedToast();
    const [stopDeployment, { isLoading: isStopping }] = useStopDeploymentMutation();

    const deployLabel = useMemo(() => {
        if (isLoading) return "—";
        return data.deploymentStatus === AgentStatus.DEVELOPMENT ? "Déployer en Production" : "Redéployer";
    }, [data.deploymentStatus, isLoading]);

    const hasBeenInProd =
        data.deploymentStatus === AgentStatus.PRODUCTION || data.latestDeployment?.toStatus === AgentStatus.PRODUCTION;

    const handleStop = async () => {
        try {
            await stopDeployment({ workspaceId, agentId }).unwrap();
            posthog?.capture("agent_stopped", { agent_id: agentId });
            toast({ title: "Agent arrêté", status: "success", duration: 3000 });
        } catch {
            toast({ title: "Erreur lors de l'arrêt de l'agent", status: "error", duration: 3000 });
        }
    };

    const renderHeader = () => {
        switch (hasBeenInProd) {
            case false:
                return <HeaderCardEmpty onOpen={onOpen} onGuideClick={() => {}} />;
            case true:
                return (
                    <HeaderCardMain
                        data={data}
                        isLoading={isLoading}
                        onOpen={onOpen}
                        onStop={handleStop}
                        isStopping={isStopping}
                        deployLabel={deployLabel}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            {renderHeader()}
            <DeployModal isOpen={isOpen} onClose={onClose} title={deployLabel} />
        </>
    );
};

export default HeaderCard;
