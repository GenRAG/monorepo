import React, { useMemo, useState } from "react";
import { Box, HStack, Input, InputGroup, InputLeftElement, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { ArrowDownUp, ArrowUpDown, Search } from "lucide-react";
import { List, type RowComponentProps } from "react-window";
import { RagModel } from "types/models/models";
import { ModelListItem } from "./ModelListItem";
import { ActionMenu } from "components/ui/ActionMenu";

type SortMode = "default" | "price-asc" | "price-desc";

interface Props {
    models: RagModel[];
    selectedModel: RagModel | null;
    onSelect: (model: RagModel) => void;
}

const ROW_HEIGHT = 56;

const getInputPrice = (m: RagModel) => parseFloat(m.pricing?.prompt ?? "0");

const SORT_LABELS: Record<SortMode, string> = {
    default: "Défaut",
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
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const subColor = useColorModeValue("grey.400", "grey.500");
    const bgColor = useColorModeValue("white", "grey.850");

    const filtered = useMemo(() => {
        const list = models.filter((m) => m.name?.toLowerCase().includes(search.toLowerCase()));
        if (sort === "price-asc") return [...list].sort((a, b) => getInputPrice(a) - getInputPrice(b));
        if (sort === "price-desc") return [...list].sort((a, b) => getInputPrice(b) - getInputPrice(a));
        return list;
    }, [models, search, sort]);

    const sortItems = (["default", "price-asc", "price-desc"] as SortMode[]).map((mode) => ({
        label: SORT_LABELS[mode],
        badge: sort === mode ? "✓" : undefined,
        onClick: () => setSort(mode),
    }));

    return (
        <VStack
            align="stretch"
            spacing={0}
            bg={bgColor}
            w="200px"
            flexShrink={0}
            borderRightWidth="1px"
            borderRightStyle="solid"
            borderRightColor={borderColor}
        >
            <Box borderBottomWidth="1px" borderBottomStyle="solid" borderBottomColor={borderColor}>
                <HStack spacing={0}>
                    <InputGroup size="xs" flex={1}>
                        <InputLeftElement pointerEvents="none">
                            <Search size={10} color="grey" />
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
                                color={sort !== "default" ? "green.500" : subColor}
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
            <Box flex={1} minH={0} pt={2}>
                {filtered.length === 0 ? (
                    <Text fontSize="11px" color={subColor} textAlign="center" pt={4}>
                        Aucun modèle
                    </Text>
                ) : (
                    <List
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
