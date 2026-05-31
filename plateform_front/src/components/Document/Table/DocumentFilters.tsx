import React, { useEffect, useState } from "react";
import { HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, useColorModeValue } from "@chakra-ui/react";
import { LayoutGrid, LayoutList, Search } from "lucide-react";
import Button from "components/System/Atoms/Button";

const TYPE_FILTERS = [
    { label: "Tous", value: null },
    { label: "PDF", value: "PDF" },
    { label: "Word", value: "Word" },
    { label: "Markdown", value: "Markdown" },
    { label: "Texte", value: "Texte" },
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
    const [localView, setLocalView] = useState<ViewMode>(viewMode);
    useEffect(() => setLocalView(viewMode), [viewMode]);
    const bg = useColorModeValue("white", "grey.900");
    const buttonBg = useColorModeValue("grey.100", "grey.800");
    const borderColor = useColorModeValue("grey.100", "grey.700");
    const textColor = useColorModeValue("grey.700", "grey.200");
    const iconActive = useColorModeValue("grey.900", "white");
    const iconMuted = useColorModeValue("grey.400", "grey.500");

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
                        variant="outline"
                        colorScheme={activeType === f.value ? "green" : "gray"}
                        onClick={() => onTypeChange(f.value)}
                    >
                        {f.label}
                    </Button>
                ))}
            </HStack>
            <Button
                size="sm"
                variant="outline"
                colorScheme="green"
                onClick={() => {
                    onOpenUpload?.();
                }}
            >
                Téléverser un document
            </Button>

            {!isMobile && (
                <HStack
                    spacing={1}
                    flexShrink={0}
                    align="center"
                    bg={bg}
                    p={1}
                    borderRadius="8px"
                    border={`1px solid`}
                    borderColor={borderColor}
                >
                    <IconButton
                        aria-label="Vue liste"
                        icon={<LayoutList size={15} />}
                        size="xs"
                        variant="ghost"
                        color={localView === "list" ? iconActive : iconMuted}
                        bg={localView === "list" ? buttonBg : bg}
                        onClick={() => {
                            setLocalView("list");
                            onViewModeChange("list");
                        }}
                    />
                    <IconButton
                        aria-label="Vue grille"
                        icon={<LayoutGrid size={15} />}
                        size="xs"
                        variant="ghost"
                        color={localView === "grid" ? iconActive : iconMuted}
                        bg={localView === "grid" ? buttonBg : bg}
                        onClick={() => {
                            setLocalView("grid");
                            onViewModeChange("grid");
                        }}
                    />
                </HStack>
            )}
        </HStack>
    );
};

export default DocumentFilters;
