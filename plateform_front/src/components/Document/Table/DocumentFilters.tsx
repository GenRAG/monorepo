import React from "react";
import { HStack, Icon, Input, InputGroup, InputLeftElement, useColorModeValue } from "@chakra-ui/react";
import { Search } from "lucide-react";
import Button from "components/ui/Button";
import MultiOptionButtons from "components/ui/MultiOptionButtons";

const TYPE_FILTERS = [
    { label: "Tous", value: null },
    { label: "PDF", value: "PDF" },
    { label: "Markdown", value: "Markdown" },
    { label: "Texte", value: "Texte" },
    { label: "Word", value: "Word" },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]["value"];
type ViewMode = "list" | "grid";

interface DocumentFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    activeType: TypeFilter;
    onTypeChange: (type: TypeFilter) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    isMobile?: boolean;
    total: number;
    onOpenUpload?: () => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
    search,
    onSearchChange,
    activeType,
    onTypeChange,
    viewMode,
    onViewModeChange,
    isMobile = false,
    total,
    onOpenUpload,
}) => {
    const textColor = useColorModeValue("grey.700", "grey.200");

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
                    color={textColor}
                />
            </InputGroup>

            <HStack spacing={2} flex={1} flexWrap="wrap" align="center">
                {TYPE_FILTERS.map((f) => (
                    <Button
                        key={f.value}
                        size="sm"
                        variant={activeType === f.value ? "superPrimary" : "outline"}
                        onClick={() => onTypeChange(f.value)}
                    >
                        {f.label}
                    </Button>
                ))}
            </HStack>

            <Button size="sm" variant="superPrimary" onClick={() => onOpenUpload?.()}>
                Téléverser un document
            </Button>

            {!isMobile && (
                <MultiOptionButtons
                    options={[
                        { value: "list", label: "Liste" },
                        { value: "grid", label: "Grille" },
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
