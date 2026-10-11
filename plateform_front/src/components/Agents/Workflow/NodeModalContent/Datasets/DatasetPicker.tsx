import { Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import Button from "components/ui/Button";
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
        <MenuItem key={dataset.id} onClick={() => onPick(dataset, needsAttach)} fontSize="sm">
            <Text noOfLines={1} flex={1}>
                {dataset.name}
            </Text>
            <Text variant="caption-xs-muted" ml={3}>
                {pluralize(dataset.documentsCount, "doc")}
            </Text>
        </MenuItem>
    );

    return (
        <Menu placement="bottom-start" matchWidth>
            <MenuButton
                as={Button}
                size="sm"
                variant="secondary"
                rightIcon={ChevronDown}
                w="100%"
                isLoading={isLoading}
                isDisabled={isEmpty}
            >
                {isEmpty ? "Aucune autre base disponible" : label}
            </MenuButton>
            <MenuList bg="surfaceCard" maxH="320px" overflowY="auto" zIndex={20}>
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
