import { VStack, Box, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WorkspaceHeader from "components/System/Molecules/WorkspaceHeader";
import { DashboardTab } from "./DashboardTab";
import { VersionsHistory } from "./VersionsHistory";
import {
    DeploymentTab,
    DeploymentTabs,
} from "components/Deployment/DeploymentTabs";

const DeploymentWorkspace = () => {
    const [activeTab, setActiveTab] = useState<DeploymentTab>(
        DeploymentTab.Dashboard,
    );

    const bgColor = useColorModeValue("white", "grey.975");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    const renderContent = () => {
        switch (activeTab) {
            case DeploymentTab.Dashboard:
                return <DashboardTab />;
            case DeploymentTab.Versions:
                return <VersionsHistory />;
        }
    };

    return (
        <VStack
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
            bg={bgColor}
        >
            <WorkspaceHeader
                title="Déploiement"
                description="Promouvoir, surveiller, et gérer les différentes versions de votre agent."
            />

            <Box
                bg={bgColor}
                borderBottom="1px solid"
                borderBottomColor={borderColor}
                flexShrink={0}
            >
                <DeploymentTabs activeTab={activeTab} onChange={setActiveTab} />
            </Box>

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
