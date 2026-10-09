import React from "react";
import { Box, HStack, Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { Search } from "lucide-react";
import Button from "components/ui/Button";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { MultiSelectDropdown } from "components/ui/MultiSelectDropdown";
import { ViewMode } from "hooks/dataset/useViewModePreference";

const TYPE_FILTERS = [
    { value: "PDF", label: "PDF" },
    { value: "Markdown", label: "Markdown" },
    { value: "Texte", label: "Texte" },
    { value: "Word", label: "Word" },
] as const;

export type TypeFilter = (typeof TYPE_FILTERS)[number]["value"];

interface DocumentFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    activeTypes: TypeFilter[];
    onTypesChange: (types: TypeFilter[]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    isMobile?: boolean;
    total: number;
    onOpenUpload?: () => void;
    /** Rendered right after the type filter (e.g. the source filter). */
    extraFilters?: React.ReactNode;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
    search,
    onSearchChange,
    activeTypes,
    onTypesChange,
    viewMode,
    onViewModeChange,
    isMobile = false,
    total,
    onOpenUpload,
    extraFilters,
}) => {
    return (
        <HStack flexWrap={{ base: "wrap", md: "nowrap" }} align="center" mb={4}>
            <InputGroup size="sm" maxW={{ base: "100%", md: "260px" }} flexShrink={0}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={Search} boxSize={3.5} />
                </InputLeftElement>
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={`Rechercher dans ${total} document${total > 1 ? "s" : ""}`}
                    fontSize="13px"
                    color="textSecondary"
                />
            </InputGroup>

            <MultiSelectDropdown
                label="Type"
                options={[...TYPE_FILTERS]}
                value={activeTypes}
                onChange={onTypesChange}
            />

            {extraFilters}

            <Box flex={1} />

            <Button size="sm" variant="superPrimary" onClick={() => onOpenUpload?.()}>
                Téléverser un document
            </Button>

            {!isMobile && (
                <MultiOptionButtons
                    options={[
                        { value: "grid", label: "Grille" },
                        { value: "table", label: "Tableau" },
                    ]}
                    value={viewMode}
                    onChange={onViewModeChange}
                    size="xs"
                />
            )}
        </HStack>
    );
};

export default DocumentFilters;
