import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, HStack, Input, InputGroup, InputLeftElement, Text, VStack, useToken } from "@chakra-ui/react";
import { ArrowDownUp, ArrowUpDown, Search } from "lucide-react";
import { List, useListRef, type RowComponentProps } from "react-window";
import { RagModel } from "types/models/models";
import { ModelListItem } from "./ModelListItem";
import { ActionMenu } from "components/ui/ActionMenu";
import { ModelFilterBar } from "./ModelFilterBar";
import {
    ModelFilters,
    NO_FILTERS,
    SortMode,
    applyModelFilters,
    countActiveFilters,
    getProviderOptions,
} from "utils/models/modelFilters";

interface Props {
    models: RagModel[];
    selectedModel: RagModel | null;
    onSelect: (model: RagModel) => void;
}

const ROW_HEIGHT = 56;

const SORT_LABELS: Record<SortMode, string> = {
    default: "Défaut",
    recent: "Plus récents",
    "price-asc": "Prix croissant",
    "price-desc": "Prix décroissant",
};

interface RowData {
    models: RagModel[];
    selectedId?: string;
    onSelect: (model: RagModel) => void;
}

const ModelRow = ({ index, style, models, selectedId, onSelect }: RowComponentProps<RowData>) => {
    const model = models[index];
    return (
        <div style={style}>
            <Box px={2} pb={2}>
                <ModelListItem model={model} isSelected={selectedId === model.id} onSelect={onSelect} />
            </Box>
        </div>
    );
};

export const ModelListPanel: React.FC<Props> = ({ models, selectedModel, onSelect }) => {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortMode>("default");
    const [filters, setFilters] = useState<ModelFilters>(NO_FILTERS);
    const [searchIconColor] = useToken("colors", ["textFaint"]);
    const listRef = useListRef(null);
    const hasScrolledToSelection = useRef(false);

    const providers = useMemo(() => getProviderOptions(models), [models]);
    const filtered = useMemo(() => applyModelFilters(models, search, filters, sort), [models, search, filters, sort]);

    useEffect(() => {
        if (hasScrolledToSelection.current || !selectedModel) return;
        const index = filtered.findIndex((m) => m.id === selectedModel.id);
        if (index === -1) return;
        listRef.current?.scrollToRow({ index, align: "center", behavior: "auto" });
        hasScrolledToSelection.current = true;
    }, [filtered, selectedModel, listRef]);

    const sortItems = (Object.keys(SORT_LABELS) as SortMode[]).map((mode) => ({
        label: SORT_LABELS[mode],
        badge: sort === mode ? "✓" : undefined,
        onClick: () => setSort(mode),
    }));

    return (
        <VStack
            align="stretch"
            spacing={0}
            bg="surfacePrimary"
            w="200px"
            flexShrink={0}
            borderRightWidth="1px"
            borderRightStyle="solid"
            borderRightColor="borderSubtle"
        >
            <Box borderBottomWidth="1px" borderBottomStyle="solid" borderBottomColor="borderSubtle">
                <HStack spacing={0}>
                    <InputGroup size="xs" flex={1}>
                        <InputLeftElement pointerEvents="none">
                            <Search size={10} color={searchIconColor} />
                        </InputLeftElement>
                        <Input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            bg="transparent"
                            border="none"
                            fontSize="11px"
                            _focus={{ boxShadow: "none", borderColor: "transparent" }}
                        />
                    </InputGroup>
                    <ActionMenu
                        trigger={
                            <Box
                                px={1.5}
                                py={1}
                                color={sort !== "default" ? "iconAccent" : "textFaint"}
                                display="flex"
                                alignItems="center"
                            >
                                {sort === "price-asc" ? <ArrowUpDown size={13} /> : <ArrowDownUp size={13} />}
                            </Box>
                        }
                        items={sortItems}
                        tooltipLabel="Trier"
                        placement="bottom-start"
                        width="180px"
                    />
                </HStack>
            </Box>
            <ModelFilterBar filters={filters} providers={providers} onChange={setFilters} />
            <Box flex={1} minH={0} pt={2}>
                {filtered.length === 0 ? (
                    <VStack spacing={1} pt={4}>
                        <Text fontSize="11px" color="textFaint">
                            Aucun modèle
                        </Text>
                        {countActiveFilters(filters) > 0 && (
                            <Text as="button" fontSize="11px" color="iconAccent" onClick={() => setFilters(NO_FILTERS)}>
                                Réinitialiser les filtres
                            </Text>
                        )}
                    </VStack>
                ) : (
                    <List
                        listRef={listRef}
                        style={{ height: "100%" }}
                        rowCount={filtered.length}
                        rowHeight={ROW_HEIGHT}
                        rowComponent={ModelRow}
                        rowProps={{ models: filtered, selectedId: selectedModel?.id, onSelect }}
                        overscanCount={6}
                    />
                )}
            </Box>
        </VStack>
    );
};
