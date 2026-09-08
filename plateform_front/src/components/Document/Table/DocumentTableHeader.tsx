import React from "react";
import { Th, Thead, Tr } from "@chakra-ui/react";

const COLUMNS = ["NOM", "TYPE", "TAILLE", "STATUT", "TÉLÉVERSÉ", "ACTIONS"];

export const DocumentTableHeader: React.FC = () => {
    return (
        <Thead position="sticky" top={0} bg="surfacePrimary" zIndex={1}>
            <Tr>
                {COLUMNS.map((col) => (
                    <Th
                        key={col}
                        textAlign={col === "ACTIONS" ? "right" : "left"}
                        width={col === "ACTIONS" ? "90px" : undefined}
                    >
                        {col}
                    </Th>
                ))}
            </Tr>
        </Thead>
    );
};

export default DocumentTableHeader;
