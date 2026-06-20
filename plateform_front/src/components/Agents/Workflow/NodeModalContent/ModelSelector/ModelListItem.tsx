import React from "react";
import { Box, HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { RagModel } from "types/models/models";
import { formatContextLength, getProviderName } from "./modelUtils";
import { getAgentAvatar } from "utils/agentAvatar";
import BoxIcon from "components/ui/BoxIcon";

interface Props {
    model: RagModel;
    isSelected: boolean;
    onSelect: (model: RagModel) => void;
}

const ModelListItemBase: React.FC<Props> = ({ model, isSelected, onSelect }) => {
    const bg = useColorModeValue(
        isSelected ? "green.50" : "white",
        isSelected ? "rgba(45, 226, 151, 0.1)" : "grey.700",
    );
    const bgHover = useColorModeValue("green.50", "grey.800");
    const borderHoverColor = useColorModeValue("green.200", "green.700");
    const nameColor = useColorModeValue("grey.800", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");

    const provider = getProviderName(model.id, model.provider);
    const ctx = model.context_length ? formatContextLength(model.context_length) : null;
    const avatarStyle = getAgentAvatar(model.name);

    return (
        <Box
            as="button"
            w="100%"
            h="48px"
            display="flex"
            alignItems="center"
            textAlign="left"
            px={2}
            bg={bg}
            borderRadius="8px"
            cursor="pointer"
            _hover={{ bg: bgHover, borderColor: borderHoverColor }}
            transition="all 0.12s"
            onClick={() => onSelect(model)}
        >
            <HStack spacing={2} align="center" w="100%">
                <BoxIcon letters={model.name.charAt(0).toUpperCase()} bg={avatarStyle.bg} color={avatarStyle.color} />
                <VStack align="stretch" spacing={0} flex={1} minW={0}>
                    <Text fontSize="11px" fontWeight={600} color={nameColor} noOfLines={1}>
                        {model.name}
                    </Text>
                    {(provider || ctx) && (
                        <Text fontSize="9px" color={subColor} noOfLines={1}>
                            {[provider, ctx].filter(Boolean).join(" · ")}
                        </Text>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
};

export const ModelListItem = React.memo(ModelListItemBase);
