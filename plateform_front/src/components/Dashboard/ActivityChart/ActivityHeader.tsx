import { HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { Activity } from "lucide-react";
import { Period } from "pages/Dashboard/data";
import MultiOptionButtons from "components/System/Atoms/MultiOptionButtons";

const PERIOD_LABELS: Record<Period, string> = {
    "24h": "24h",
    "7j": "7j",
    "30j": "30j",
};

export const ActivityHeader = ({ period, setPeriod }: { period: Period; setPeriod: (period: Period) => void }) => {
    return (
        <Stack
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            w="100%"
            spacing={2}
            borderBottom="1px solid"
            borderBottomColor="borderDefault"
            p={4}
        >
            <HStack spacing={2}>
                <Icon as={Activity} boxSize={3.5} color="textPrimary" />
                <Text variant="body-md-semibold">Activité conversations</Text>
            </HStack>
            <MultiOptionButtons
                options={(Object.keys(PERIOD_LABELS) as Period[]).map((p) => ({ value: p, label: PERIOD_LABELS[p] }))}
                value={period}
                onChange={(v) => setPeriod(v as Period)}
            />
        </Stack>
    );
};
