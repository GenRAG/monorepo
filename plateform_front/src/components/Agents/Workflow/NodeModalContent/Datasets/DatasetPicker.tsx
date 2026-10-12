import {
    Box,
    HStack,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuList,
    Spinner,
    Text,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { DatasetEntity } from "types/dataset/dataset";
import { pluralize } from "utils/dataset/datasetStatus";

interface DatasetPickerProps {
    label: string;
    attached: DatasetEntity[];
    others: DatasetEntity[];
    excludedIds: string[];
    onPick: (dataset: DatasetEntity, needsAttach: boolean) => void;
    isLoading?: boolean;
}

/** Agent's datasets first; picking one of the others also attaches it to the agent. */
export const DatasetPicker = ({ label, attached, others, excludedIds, onPick, isLoading }: DatasetPickerProps) => {
    const agentChoices = attached.filter((d) => !excludedIds.includes(d.id));
    const otherChoices = others.filter((d) => !excludedIds.includes(d.id));
    const isEmpty = agentChoices.length === 0 && otherChoices.length === 0;

    const renderItem = (dataset: DatasetEntity, needsAttach: boolean) => (
        <MenuItem key={dataset.id} onClick={() => onPick(dataset, needsAttach)}>
            <Text as="span" noOfLines={1} flex={1}>
                {dataset.name}
            </Text>
            <Text as="span" fontSize="xs" opacity={0.55} ml={3}>
                {pluralize(dataset.documentsCount, "doc")}
            </Text>
        </MenuItem>
    );

    return (
        <Menu variant="glass" placement="bottom-start" matchWidth gutter={6}>
            <MenuButton w="100%" textAlign="left" disabled={isLoading || isEmpty}>
                <HStack justify="space-between">
                    <Text as="span" noOfLines={1}>
                        {isLoading ? "Chargement…" : isEmpty ? "Aucune autre base disponible" : label}
                    </Text>
                    {isLoading ? (
                        <Spinner size="xs" />
                    ) : (
                        <Box as={ChevronDown} size={14} opacity={0.6} flexShrink={0} />
                    )}
                </HStack>
            </MenuButton>
            <MenuList maxH="320px" overflowY="auto" zIndex={20}>
                {agentChoices.length > 0 && (
                    <MenuGroup title="Bases de l'agent">{agentChoices.map((d) => renderItem(d, false))}</MenuGroup>
                )}
                {agentChoices.length > 0 && otherChoices.length > 0 && <MenuDivider />}
                {otherChoices.length > 0 && (
                    <MenuGroup title="Ajouter à cet agent">{otherChoices.map((d) => renderItem(d, true))}</MenuGroup>
                )}
            </MenuList>
        </Menu>
    );
};
