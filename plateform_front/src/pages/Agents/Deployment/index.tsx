import { VStack, HStack, Box, Button, useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import WorkspaceHeader from "components/System/Molecules/WorkspaceHeader";

import {
    LockIcon,
    ActivityIcon,
    SettingsIcon,
    HistoryIcon,
} from "lucide-react";
import { DashboardTab } from "pages/Agents/Deployment/DashboardTab";
import { VersionsHistory } from "pages/Agents/Deployment/VersionsHistory";
import { AccessControl } from "pages/Agents/Deployment/AccessControl";
import { Settings } from "pages/Agents/Deployment/Settings";

export type DeploymentStatus = "live" | "draft" | "offline";

enum DeploymentTab {
    DASHBOARD = "dashboard",
    VERSIONS_HISTORY = "versionsHistory",
    SETTINGS = "settings",
    ACCESS_CONTROL = "accessControl",
}

const DeploymentWorkspace = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    const [selectedTab, setSelectedTab] = useState(DeploymentTab.DASHBOARD);

    const renderTabContent = () => {
        switch (selectedTab) {
            case DeploymentTab.DASHBOARD:
                return <DashboardTab isDark={isDark} />;
            case DeploymentTab.VERSIONS_HISTORY:
                return <VersionsHistory isDark={isDark} />;
            case DeploymentTab.ACCESS_CONTROL:
                return <AccessControl isDark={isDark} />;
            case DeploymentTab.SETTINGS:
                return <Settings isDark={isDark} />;
            default:
                return null;
        }
    };

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <WorkspaceHeader
                title="Deployment"
                description="Manage staging and production deployments for your assistant."
            />
            <HStack
                borderBottom="1px solid"
                borderColor={isDark ? "grey.700" : "grey.200"}
                w="100%"
                spacing={0}
                px={6}
                pt={2}
                pl={0}
                bg={isDark ? "grey.950" : "white"}
            >
                <Button
                    size="md"
                    variant="ghost"
                    borderBottom="2px solid"
                    borderColor={
                        selectedTab === DeploymentTab.DASHBOARD
                            ? "green.500"
                            : "transparent"
                    }
                    borderRadius="0"
                    color={
                        selectedTab === DeploymentTab.DASHBOARD
                            ? isDark
                                ? "green.400"
                                : "green.600"
                            : isDark
                              ? "grey.400"
                              : "grey.600"
                    }
                    fontWeight={
                        selectedTab === DeploymentTab.DASHBOARD ? "600" : "500"
                    }
                    leftIcon={<ActivityIcon size={16} />}
                    onClick={() => setSelectedTab(DeploymentTab.DASHBOARD)}
                    _hover={{ bg: isDark ? "grey.900" : "white" }}
                >
                    Dashboard
                </Button>
                <Button
                    size="md"
                    variant="ghost"
                    color={
                        selectedTab === DeploymentTab.VERSIONS_HISTORY
                            ? isDark
                                ? "green.400"
                                : "green.600"
                            : isDark
                              ? "grey.400"
                              : "grey.600"
                    }
                    fontWeight={
                        selectedTab === DeploymentTab.VERSIONS_HISTORY
                            ? "600"
                            : "500"
                    }
                    borderBottom="2px solid"
                    borderRadius="0"
                    borderColor={
                        selectedTab === DeploymentTab.VERSIONS_HISTORY
                            ? "green.500"
                            : "transparent"
                    }
                    leftIcon={<HistoryIcon size={16} />}
                    onClick={() =>
                        setSelectedTab(DeploymentTab.VERSIONS_HISTORY)
                    }
                    _hover={{ bg: isDark ? "grey.900" : "white" }}
                >
                    Version History
                </Button>
                <Button
                    size="md"
                    variant="ghost"
                    borderBottom="2px solid"
                    borderColor={
                        selectedTab === DeploymentTab.ACCESS_CONTROL
                            ? "green.500"
                            : "transparent"
                    }
                    borderRadius="0"
                    color={
                        selectedTab === DeploymentTab.ACCESS_CONTROL
                            ? isDark
                                ? "green.400"
                                : "green.600"
                            : isDark
                              ? "grey.400"
                              : "grey.600"
                    }
                    fontWeight={
                        selectedTab === DeploymentTab.ACCESS_CONTROL
                            ? "600"
                            : "500"
                    }
                    leftIcon={<LockIcon size={16} />}
                    onClick={() => setSelectedTab(DeploymentTab.ACCESS_CONTROL)}
                    _hover={{ bg: isDark ? "grey.900" : "white" }}
                >
                    Access Control
                </Button>
                <Button
                    size="md"
                    variant="ghost"
                    borderBottom="2px solid"
                    borderColor={
                        selectedTab === DeploymentTab.SETTINGS
                            ? "green.500"
                            : "transparent"
                    }
                    borderRadius="0"
                    color={
                        selectedTab === DeploymentTab.SETTINGS
                            ? isDark
                                ? "green.400"
                                : "green.600"
                            : isDark
                              ? "grey.400"
                              : "grey.600"
                    }
                    fontWeight={
                        selectedTab === DeploymentTab.SETTINGS ? "600" : "500"
                    }
                    leftIcon={<SettingsIcon size={16} />}
                    onClick={() => setSelectedTab(DeploymentTab.SETTINGS)}
                    _hover={{ bg: isDark ? "grey.900" : "white" }}
                >
                    Settings
                </Button>
            </HStack>
            <VStack
                w="100%"
                flex={1}
                align="stretch"
                spacing={0}
                overflow="auto"
                bg={isDark ? "grey.975" : "white"}
            >
                <Box p={6}>{renderTabContent()}</Box>
            </VStack>
        </VStack>
    );
};

export default DeploymentWorkspace;
