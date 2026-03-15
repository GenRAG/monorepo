import { Grid } from "@chakra-ui/react";
import { StatCard } from "pages/Workspace/Documents/SimpleDocumentWorkspace";

const METRICS = [
    { value: "1.4s", label: "Avg Response Time" },
    {
        value: "124",
        label: "Total Conversations",
    },
    {
        value: "38",
        label: "Documents Indexed",
    },
    {
        value: "2",
        label: "Active Assistants",
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
