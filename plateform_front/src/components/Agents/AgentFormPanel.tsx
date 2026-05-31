import React, { useEffect } from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    Input,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { MessageSquare } from "lucide-react";
import TemplateCard from "components/Agents/TemplateCard";
import type { AppNode } from "@genrag/workflow";
import type { Edge } from "@xyflow/react";
import BoxIcon from "components/System/Atoms/BoxIcon";

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

interface FormValues {
    name: string;
    description: string;
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
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { isValid },
    } = useForm<FormValues>({
        defaultValues: { name: "", description: "" },
        mode: "onChange",
    });

    const name = watch("name");
    const description = watch("description");

    useEffect(() => {
        if (isOpen) {
            reset({ name: "", description: "" });
            onTemplateSelect(null);
        }
    }, [isOpen, onTemplateSelect, reset]);

    const handleSelectTemplate = (tpl: Template) => {
        if (selectedTemplate?.id === tpl.id) {
            onTemplateSelect(null);
            return;
        }
        onTemplateSelect(tpl);
        if (!name) setValue("name", tpl.name, { shouldValidate: true });
        if (!description) setValue("description", tpl.description);
    };

    const onSubmit = ({ name, description }: FormValues) => {
        onCreate(name, description);
    };

    return (
        <Flex
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            direction="column"
            borderRight="1px solid"
            borderColor="borderDefault"
            overflowY="auto"
        >
            <Stack p={6}>
                <Heading variant="heading-xl" mb={8}>
                    Créer à partir de zéro
                </Heading>

                <Text variant="body-md" color="textLabel" fontWeight={500} mb={3}>
                    Choisir un type d&apos;application
                </Text>

                <Box
                    p={4}
                    borderRadius="10px"
                    border="1.5px solid"
                    borderColor="green.500"
                    bg="accentCardBg"
                    maxW="260px"
                    cursor="pointer"
                >
                    <HStack spacing={3} align="flex-start">
                        <BoxIcon icon={MessageSquare} />
                        <VStack align="start" spacing={0}>
                            <Text variant="body-sm-semibold" lineHeight="1.3">
                                Flux de conversation d&apos;agent
                            </Text>
                            <Text variant="body-xs" color="textLabel" lineHeight="1.5" mt="2px">
                                Flux de travail optimisé pour créer des assistants de chat
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            </Stack>

            <Divider borderColor="borderDefault" mb={7} />

            <Stack p={6}>
                <Text variant="body-md" mb={3}>
                    Nom de l&apos;application
                </Text>

                <Input
                    {...register("name", { required: true, validate: (v) => v.trim().length > 0 })}
                    placeholder="Donnez un nom à votre application"
                    mb={6}
                    autoFocus
                />

                <Text variant="body-sm" fontWeight={500} mb={3}>
                    Description{" "}
                    <Text as="span" color="textMuted">
                        (Facultative)
                    </Text>
                </Text>

                <Textarea
                    {...register("description")}
                    placeholder="Entrez la description de l'application"
                    rows={4}
                    mb={6}
                />

                <Text variant="body-sm" color="textLabel" fontWeight={500} mb={3}>
                    Ou partir d&apos;un modèle
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
                        <Button variant="ghost" onClick={onClose} type="button">
                            Annuler
                        </Button>

                        <Button type="submit" isDisabled={!isValid} isLoading={isLoading} variant="primary">
                            Créer
                        </Button>
                    </HStack>
                </HStack>
            </Stack>
        </Flex>
    );
};
