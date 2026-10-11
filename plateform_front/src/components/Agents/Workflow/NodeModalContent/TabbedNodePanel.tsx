import type { ReactNode } from "react";
import { TabBar } from "components/ui/TabBar";

const TABS = [{ value: "Aperçu", label: "Aperçu" }];

/** Shell of the read-only node side panels: the « Aperçu » tab. */
export const TabbedNodePanel = ({ overview }: { overview: ReactNode }) => (
    <>
        <TabBar tabs={TABS} activeTab="Aperçu" onChange={() => {}} />
        {overview}
    </>
);
