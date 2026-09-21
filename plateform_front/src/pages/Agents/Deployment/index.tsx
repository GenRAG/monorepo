import { VStack, Box } from "@chakra-ui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WorkspaceHeader from "components/ui/WorkspaceHeader";
import { DashboardTab } from "./DashboardTab";
import { VersionsHistory } from "./VersionsHistory";
import { DeploymentTab, DeploymentTabs } from "components/Deployment/DeploymentTabs";
import MembersSection from "components/Deployment/AccessControl/MembersSection";

const DeploymentWorkspace = () => {
    const [activeTab, setActiveTab] = useState<DeploymentTab>(DeploymentTab.Dashboard);

    const renderContent = () => {
        switch (activeTab) {
            case DeploymentTab.Dashboard:
                return <DashboardTab />;
            case DeploymentTab.Versions:
                return <VersionsHistory />;
            case DeploymentTab.Access:
                return <MembersSection />;
        }
    };

    return (
        <VStack h="100%" align="stretch" spacing={0} overflow="hidden" position="relative">
            <WorkspaceHeader
                title="Déploiement"
                description="Promouvoir, surveiller, et gérer les différentes versions de votre agent."
            />
            {/* Position absolute (pas fixed) : centrée sur cette page (relative), pas sur l'écran
            entier. Rendue en dehors du flux, sous forme de pilule flottante permanente au-dessus
            du contenu — voir GlassTabBar. Pas de padding-bottom réservé : le fond de la carte de
            contenu (PrivateAgentAppLayout) va jusqu'au bout, la pilule flotte par-dessus. */}
            <DeploymentTabs activeTab={activeTab} onChange={setActiveTab} />

            <Box flex={1} minW={0} display="flex" overflow="hidden">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        style={{
                            flex: 1,
                            display: "flex",
                            overflow: "hidden",
                            minHeight: 0,
                            minWidth: 0,
                            width: "100%",
                        }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </VStack>
    );
};

export default DeploymentWorkspace;
