import React from "react";
import { MultiSelectDropdown } from "components/ui/MultiSelectDropdown";
import { DocumentSource } from "types/dataset/dataset";
import { DOCUMENT_SOURCE_LABELS, DOCUMENT_SOURCES } from "utils/dataset/documentSource";

interface DocumentSourceFilterProps {
    value: DocumentSource[];
    onChange: (value: DocumentSource[]) => void;
    counts: Partial<Record<DocumentSource, number>>;
}

/** Every source is listed (with its count) so the future connectors are already visible. */
export const DocumentSourceFilter: React.FC<DocumentSourceFilterProps> = ({ value, onChange, counts }) => (
    <MultiSelectDropdown
        label="Source"
        options={DOCUMENT_SOURCES.map((source) => ({
            value: source,
            label: DOCUMENT_SOURCE_LABELS[source],
            count: counts[source] ?? 0,
        }))}
        value={value}
        onChange={onChange}
    />
);
