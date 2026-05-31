import { useState } from "react";
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";

import QueryOverviewTab from "pages/Agents/Workflow/NodeModalContent/Query/QueryNodeOverviewTab";

const QueryNodeModal = () => {
    const [selectedTab, setSelectedTab] = useState<string>("Overview");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const labelColor = useColorModeValue("grey.600", "grey.400");

    return (
        <>
            <Flex px={4} pt={3} borderBottom="1px solid" borderColor={borderColor} gap={4}>
                {["Overview", "Settings"].map((tab, idx) => (
                    <Text
                        key={tab}
                        fontSize="sm"
                        fontWeight={idx === 1 ? "semibold" : "normal"}
                        color={selectedTab === tab ? "green.500" : labelColor}
                        pb={2}
                        cursor="pointer"
                        _hover={{ color: "inherit" }}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </Text>
                ))}
            </Flex>
            {selectedTab === "Overview" && <QueryOverviewTab />}
        </>
    );
};

export default QueryNodeModal;
