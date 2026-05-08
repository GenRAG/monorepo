import { useDisclosure } from "@chakra-ui/react";
import { DeployModal } from "components/Deployment/DeployModal";
import { AgentStatus, CurrentDeployment } from "types/deployment/deployment";
import { useMemo } from "react";
import HeaderCardEmpty from "components/Deployment/DashboardTab/HeaderCard/HeaderCardEmpty";
import HeaderCardMain from "components/Deployment/DashboardTab/HeaderCard/HeaderCardMain";

interface HeaderCardProps {
    data: CurrentDeployment;
    isLoading: boolean;
}

export const HeaderCard = ({ data, isLoading }: HeaderCardProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const deployLabel = useMemo(() => {
        if (isLoading) return "—";

        return data.deploymentStatus === AgentStatus.DEVELOPMENT
            ? "Déployer en Production"
            : "Redéployer";
    }, [data.deploymentStatus, isLoading]);

    const hasBeenInProd =
        data.deploymentStatus === AgentStatus.PRODUCTION ||
        data.latestDeployment?.toStatus === AgentStatus.PRODUCTION;

    const renderHeader = () => {
        switch (hasBeenInProd) {
            case false:
                return (
                    <HeaderCardEmpty onOpen={onOpen} onGuideClick={() => {}} />
                );
            case true:
                return (
                    <HeaderCardMain
                        data={data}
                        isLoading={isLoading}
                        onOpen={onOpen}
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

            <DeployModal
                isOpen={isOpen}
                onClose={onClose}
                title={deployLabel}
            />
        </>
    );
};

export default HeaderCard;
