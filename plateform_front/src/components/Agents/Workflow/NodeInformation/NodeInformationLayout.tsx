import type { ReactNode } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ImpactBar } from "components/ui/ImpactBar";
import { BenefitItem } from "components/Agents/Workflow/NodeInformation/BenefitItem";

interface ImpactMetric {
    label: string;
    value: number;
}

interface Benefit {
    title: string;
    description: string;
}

interface NodeInformationLayoutProps {
    title: string;
    description: string;
    highlight: ReactNode;
    animation: ReactNode;
    metrics: ImpactMetric[];
    benefits: Benefit[];
}

export const NodeInformationLayout = ({
    title,
    description,
    highlight,
    animation,
    metrics,
    benefits,
}: NodeInformationLayoutProps) => (
    <HStack flex={1} spacing={6} align="stretch" overflowY="auto" w="full">
        <VStack w="full" p={4}>
            <Box w="full">
                <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                    {title}
                </Text>

                <Text fontSize="sm" color="textDescription">
                    {description}
                </Text>

                <Text fontSize="sm" mt={2} color="textDescription">
                    {highlight}
                </Text>
            </Box>

            <Box
                position="relative"
                w="100%"
                h="280px"
                bg="backgroundDefault"
                borderRadius="16px"
                border="1px solid"
                borderColor="borderPanel"
                overflow="hidden"
            >
                {animation}
            </Box>
        </VStack>
        <Box w="1px" alignSelf="stretch" bg="dividerStrong" />
        <VStack w="full" p={4}>
            <VStack w="full" align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                    Impact sur votre workflow
                </Text>

                {metrics.map((metric) => (
                    <ImpactBar key={metric.label} label={metric.label} value={metric.value} />
                ))}
            </VStack>
            <VStack spacing={3} mt="5px" align="stretch">
                {benefits.map((benefit) => (
                    <BenefitItem key={benefit.title} title={benefit.title} description={benefit.description} />
                ))}
            </VStack>
        </VStack>
    </HStack>
);
