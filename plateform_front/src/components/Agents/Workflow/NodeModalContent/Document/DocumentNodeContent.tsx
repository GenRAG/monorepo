import { useState } from "react";
import { TabBar } from "components/ui/TabBar";
import DocumentOverviewTab from "./DocumentNodeOverviewTab";

const TABS = [{ value: "Aperçu", label: "Aperçu" }];

const DatabaseNodeModal = () => {
    const [selectedTab, setSelectedTab] = useState("Aperçu");

    return (
        <>
            <TabBar tabs={TABS} activeTab={selectedTab} onChange={setSelectedTab} />
            {selectedTab === "Aperçu" && <DocumentOverviewTab />}
        </>
    );
};

export default DatabaseNodeModal;
