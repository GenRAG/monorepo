import React from "react";
import { Th, Thead, Tr } from "@chakra-ui/react";
import { DOCUMENT_TH_PROPS } from "./documentTableStyles";

const COLUMNS = ["Document", "Provenance", "Taille", "Statut", "Ajouté"];

export const DocumentTableHeader: React.FC = () => (
    <Thead bg="secondBackgroundDefault">
        <Tr>
            {COLUMNS.map((label) => (
                <Th key={label} {...DOCUMENT_TH_PROPS}>
                    {label}
                </Th>
            ))}
            <Th {...DOCUMENT_TH_PROPS} w="1px" />
        </Tr>
    </Thead>
);

export default DocumentTableHeader;
