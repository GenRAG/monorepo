import React, { useEffect, useRef } from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Input,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { MessageSquare } from "lucide-react";
import TemplateCard from "components/Agents/TemplateCard";
import type { AppNode } from "@genrag/workflow";
import type { Edge } from "@xyflow/react";

export interface Template {
    id: string;
    name: string;
    description: string;
    nodes: AppNode[];
    edges: Edge[];
}

interface AgentFormPanelProps {
    isOpen: boolean;
    templates: Template[];
    selectedTemplate: Template | null;
    onTemplateSelect: (tpl: Template | null) => void;
    isLoading: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string) => void;
}

export const AgentFormPanel: React.FC<AgentFormPanelProps> = ({
    isOpen,
    templates,
    selectedTemplate,
    onTemplateSelect,
    isLoading,
    onClose,
    onCreate,
}) => {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName("");
            setDescription("");
            onTemplateSelect(null);
            setTimeout(() => nameInputRef.current?.focus(), 80);
        }
    }, [isOpen, onTemplateSelect]);

    const handleSelectTemplate = (tpl: Template) => {
        if (selectedTemplate?.id === tpl.id) {
            onTemplateSelect(null);
            return;
        }
        onTemplateSelect(tpl);
        if (!name) setName(tpl.name);
        if (!description) setDescription(tpl.description);
    };

    const canCreate = name.trim().length > 0;

    const dividerColor = useColorModeValue("grey.100", "grey.800");
    const titleColor = useColorModeValue("grey.900", "grey.100");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const mutedColor = useColorModeValue("grey.400", "grey.600");
    const typeCardActiveBg = useColorModeValue("green.50", "grey.850");
    const typeCardIconBg = useColorModeValue("green.100", "grey.800");

    return (
        <Flex
            direction="column"
            px={16}
            pt={16}
            pb={8}
            borderRight="1px solid"
            borderColor={dividerColor}
            overflowY="auto"
        >
            <Text
                fontSize="24px"
                fontWeight="600"
                color={titleColor}
                mb={8}
                lineHeight="1.2"
            >
                Create from Blank
            </Text>

            <Text fontSize="13px" fontWeight="500" color={labelColor} mb={3}>
                Choose an App Type
            </Text>

            <Box
                p={4}
                borderRadius="10px"
                border="1.5px solid"
                borderColor="green.500"
                bg={typeCardActiveBg}
                mb={7}
                maxW="260px"
                cursor="default"
            >
                <HStack spacing={3} align="flex-start">
                    <Box
                        w="36px"
                        h="36px"
                        borderRadius="8px"
                        bg={typeCardIconBg}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Icon
                            as={MessageSquare}
                            boxSize="16px"
                            color="green.500"
                        />
                    </Box>
                    <VStack align="start" spacing={0}>
                        <Text
                            fontSize="14px"
                            fontWeight="600"
                            color={titleColor}
                            lineHeight="1.3"
                        >
                            Agent Chatflow
                        </Text>
                        <Text
                            fontSize="12px"
                            color={labelColor}
                            lineHeight="1.5"
                            mt="2px"
                        >
                            Workflow enhanced for creating chat assistants
                        </Text>
                    </VStack>
                </HStack>
            </Box>

            <Divider borderColor={dividerColor} mb={7} />

            <Text fontSize="13px" fontWeight="500" color={titleColor} mb={3}>
                App Name
            </Text>

            <Input
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Give your app a name"
                mb={6}
            />

            <Text fontSize="sm" fontWeight="500" color={titleColor} mb={3}>
                Description{" "}
                <Text as="span" fontWeight="400" color={mutedColor}>
                    (Optional)
                </Text>
            </Text>

            <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the description of the app"
                rows={4}
                mb={6}
            />

            <Text fontSize="sm" fontWeight="500" color={labelColor} mb={3}>
                Ou partir d&apos;un template
            </Text>

            <SimpleGrid columns={3} spacing={3} mb={6}>
                {templates.map((tpl) => (
                    <TemplateCard
                        key={tpl.id}
                        title={tpl.name}
                        description={tpl.description}
                        isSelected={selectedTemplate?.id === tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                    />
                ))}
            </SimpleGrid>

            <Box flex={1} />

            <HStack justify="flex-end" align="center" pt={4}>
                <HStack spacing={2}>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        onClick={() => onCreate(name, description)}
                        isDisabled={!canCreate}
                        isLoading={isLoading}
                        variant="primary"
                    >
                        Create
                    </Button>
                </HStack>
            </HStack>
        </Flex>
    );
};
