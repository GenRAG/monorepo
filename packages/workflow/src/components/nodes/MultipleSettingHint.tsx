import { useNodeConnections } from "@xyflow/react";
import { Text, useColorModeValue } from "@chakra-ui/react";
import { settingSourceHandle } from "../../types/edge";

/** Under a `multiple` input row: how many settings hang off it, or what having none means. */
export const MultipleSettingHint = ({ inputName, isMobile }: { inputName: string; isMobile?: boolean }) => {
    const connections = useNodeConnections({ handleType: "source", handleId: settingSourceHandle(inputName) });
    const color = useColorModeValue("grey.400", "grey.500");
    const count = connections.length;

    return (
        <Text fontSize={isMobile ? "8px" : "10px"} color={color} noOfLines={1}>
            {count === 0 ? "Toutes les bases de l'agent" : `${count} base${count > 1 ? "s" : ""} sélectionnée${count > 1 ? "s" : ""}`}
        </Text>
    );
};
