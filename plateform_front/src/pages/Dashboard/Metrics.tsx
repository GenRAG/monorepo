import {
    Box,
    Card,
    CardBody,
    Grid,
    HStack,
    Icon,
    Text,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { Brain, FileText, MessageSquare, Zap } from "lucide-react";

const METRICS = [
    { icon: Zap, value: "1.4s", label: "Avg Response Time", color: "green" },
    {
        icon: MessageSquare,
        value: "124",
        label: "Total Conversations",
        color: "blue",
    },
    {
        icon: FileText,
        value: "38",
        label: "Documents Indexed",
        color: "orange",
    },
    {
        icon: Brain,
        value: "2",
        label: "Active Assistants",
        color: "purple",
    },
];

export const Metrics = () => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const textPrimary = useColorModeValue("grey.950", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    return (
        <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            gap={{ base: 3, md: 6 }}
            w="100%"
        >
            {METRICS.map(({ icon: IconComponent, value, label }) => (
                <Card
                    key={label}
                    display="flex"
                    gap={3}
                    p={{ base: 2, md: 0 }}
                    borderColor={borderColor}
                    bg={colorMode === "dark" ? "grey.800" : "white"}
                >
                    <CardBody>
                        <Icon
                            as={IconComponent}
                            boxSize={5}
                            flexShrink={0}
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.800"
                            }
                        />
                        <HStack minW={0}>
                            <Text variant="body-md" color={textPrimary}>
                                {value}
                            </Text>
                            <Text
                                variant="body-md"
                                color={textSecondary}
                                fontSize={{ base: "xs", md: "md" }}
                                noOfLines={1}
                            >
                                {label}
                            </Text>
                        </HStack>
                    </CardBody>
                </Card>
            ))}
        </Grid>
    );
};
