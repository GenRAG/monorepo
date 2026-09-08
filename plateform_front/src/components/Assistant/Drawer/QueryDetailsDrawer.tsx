import React, { useState } from "react";
import { Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButton } from "@chakra-ui/react";
import { TabBar } from "@/components/ui/TabBar";
import { QueryDetailsDrawerHeader } from "./QueryDetailsDrawerHeader";
import { QuerySourcesTab } from "./QuerySourcesTab";
import { QueryDetailsTab } from "./QueryDetailsTab";
import { QuerySource, QueryDetailsInfo } from "./types";

interface QueryDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    agentTitle: string;
    assistantId: string;
    sources: QuerySource[];
    details: QueryDetailsInfo;
}

const TAB_SOURCES = "sources";
const TAB_DETAILS = "details";

export const QueryDetailsDrawer: React.FC<QueryDetailsDrawerProps> = ({
    isOpen,
    onClose,
    agentTitle,
    assistantId,
    sources,
    details,
}) => {
    const [activeTab, setActiveTab] = useState(TAB_SOURCES);

    const tabs = [
        { value: TAB_SOURCES, label: `Sources (${sources.length})` },
        { value: TAB_DETAILS, label: "Détails" },
    ];

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
            <DrawerOverlay />
            <DrawerContent bg="surfacePrimary">
                <DrawerCloseButton />
                <QueryDetailsDrawerHeader agentTitle={agentTitle} agentVersion={details.agentVersion} />
                <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                <DrawerBody bg="surfacePrimary" px={4} py={4}>
                    {activeTab === TAB_SOURCES ? (
                        <QuerySourcesTab sources={sources} assistantId={assistantId} />
                    ) : (
                        <QueryDetailsTab details={details} />
                    )}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};
