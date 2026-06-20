import { useState } from "react";
import { TabBar } from "components/ui/TabBar";
import QueryOverviewTab from "components/Agents/Workflow/NodeModalContent/Query/QueryNodeOverviewTab";

const TABS = [{ value: "Aperçu", label: "Aperçu" }];

const QueryNodeModal = () => {
    const [selectedTab, setSelectedTab] = useState("Aperçu");

    return (
        <>
            <TabBar tabs={TABS} activeTab={selectedTab} onChange={setSelectedTab} />
            {selectedTab === "Aperçu" && <QueryOverviewTab />}
        </>
    );
};

export default QueryNodeModal;
