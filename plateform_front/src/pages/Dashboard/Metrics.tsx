import { Grid } from "@chakra-ui/react";
import { Brain, FileText, MessageSquare, Zap } from "lucide-react";
import { StatCard } from "pages/Workspace/Documents/SimpleDocumentWorkspace";

const METRICS = [
    { icon: Zap, value: "1.4s", label: "Avg Response Time", color: "green" },
    {
        icon: MessageSquare,
        value: "124",
        label: "Total Conversations",
        color: "blue",
    },
    {
        icon: FileText,
        value: "38",
        label: "Documents Indexed",
        color: "orange",
    },
    {
        icon: Brain,
        value: "2",
        label: "Active Assistants",
        color: "purple",
    },
];

export const Metrics = () => {
    return (
        <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            gap={{ base: 3, md: 6 }}
            w="100%"
        >
            {METRICS.map(({ value, label }) => (
                <StatCard label={label} value={value} key={label} />
            ))}
        </Grid>
    );
};
