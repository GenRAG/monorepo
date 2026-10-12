import React from "react";
import { Box, Center, HStack, Icon, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";
import { Search } from "lucide-react";
import Button from "components/ui/Button";
import { MultiSelectDropdown } from "components/ui/MultiSelectDropdown";
import { getFileTypeBadgeConfig } from "utils/documentFormatters";

const TYPE_FILTERS = [
    { value: "PDF", label: "PDF", mimeType: "application/pdf" },
    { value: "Markdown", label: "Markdown", mimeType: "text/markdown" },
    { value: "Texte", label: "Texte", mimeType: "text/plain" },
    { value: "Word", label: "Word", mimeType: "application/msword" },
] as const;

export type TypeFilter = (typeof TYPE_FILTERS)[number]["value"];

/** Same colored tile as the document rows, shrunk to the menu. */
const FileTypeTile = ({ mimeType }: { mimeType: string }) => {
    const badge = getFileTypeBadgeConfig(mimeType);
    return (
        <Center w="20px" h="20px" borderRadius="5px" bg={badge.bg} color={badge.color} flexShrink={0}>
            <Text as="span" fontSize="7px" fontWeight="bold" letterSpacing="0.02em">
                {badge.label}
            </Text>
        </Center>
    );
};

const TYPE_OPTIONS = TYPE_FILTERS.map(({ value, label, mimeType }) => ({
    value,
    label,
    icon: <FileTypeTile mimeType={mimeType} />,
}));

interface DocumentFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    activeTypes: TypeFilter[];
    onTypesChange: (types: TypeFilter[]) => void;
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
                    variant="glass"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={`Rechercher dans ${total} document${total > 1 ? "s" : ""}`}
                    fontSize="13px"
                    color="textSecondary"
                />
            </InputGroup>

            <MultiSelectDropdown label="Type" options={TYPE_OPTIONS} value={activeTypes} onChange={onTypesChange} />

            {extraFilters}

            <Box flex={1} />

            <Button size="sm" variant="superPrimary" onClick={() => onOpenUpload?.()}>
                Téléverser un document
            </Button>
        </HStack>
    );
};

export default DocumentFilters;
