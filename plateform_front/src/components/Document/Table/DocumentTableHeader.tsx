import React from "react";
import { Th, Thead, Tr, useColorModeValue } from "@chakra-ui/react";

const COLUMNS = ["NOM", "TYPE", "TAILLE", "STATUT", "TÉLÉVERSÉ", "ACTIONS"];

export const DocumentTableHeader: React.FC = () => {
    const headerBg = useColorModeValue("white", "grey.950");
    const mutedColor = useColorModeValue("grey.700", "grey.700");

    return (
        <Thead position="sticky" top={0} bg={headerBg} zIndex={1}>
            <Tr>
                {COLUMNS.map((col) => (
                    <Th
                        key={col}
                        sx={{ fontSize: "10px !important" }}
                        fontWeight="700"
                        color={mutedColor}
                        textAlign={col === "ACTIONS" ? "right" : "left"}
                        width={col === "ACTIONS" ? "90px" : undefined}
                        py={2}
                    >
                        {col}
                    </Th>
                ))}
            </Tr>
        </Thead>
    );
};

export default DocumentTableHeader;
