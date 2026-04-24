import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    HStack,
    SimpleGrid,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";
import {
    GitGraph,
    PlayIcon,
    RotateCwIcon,
    Sparkles,
    FileText,
} from "lucide-react";
import { StatCard } from "components/Document/StatCard";

type EnvironmentTone = "staging" | "production";

type EnvironmentMeta = {
    label: string;
    version: string;
    status: string;
    statusColorScheme: string;
    accentBorder: string;
    badgeColorScheme: string;
};

const stagingMeta: EnvironmentMeta = {
    label: "Staging",
    version: "v12",
    status: "Ready",
    statusColorScheme: "orange",
    accentBorder: "orange.400",
    badgeColorScheme: "orange",
};

const productionMeta: EnvironmentMeta = {
    label: "Live",
    version: "v10",
    status: "Live",
    statusColorScheme: "green",
    accentBorder: "green.500",
    badgeColorScheme: "green",
};

const stagingChanges = [
    {
        label: "Prompt",
        colorScheme: "grey",
        detail: "Refined response instructions for safer citations",
    },
    {
        label: "RAG",
        colorScheme: "green",
        detail: "Added 8 fresh documents to the retrieval index",
    },
    {
        label: "Tooling",
        colorScheme: "blue",
        detail: "Enabled document lookup and workspace context tools",
    },
];

const EnvironmentCard = ({
    meta,
    tone,
    showChanges,
    isDark,
}: {
    meta: EnvironmentMeta;
    tone: EnvironmentTone;
    showChanges?: boolean;
    isDark: boolean;
}) => {
    const isStaging = tone === "staging";

    return (
        <Card
            borderRadius="12px"
            border="0.5px solid"
            borderColor={isDark ? "whiteAlpha.100" : "grey.200"}
            borderTopWidth="2px"
            borderTopColor={meta.accentBorder}
            bg={isDark ? "grey.900" : "white"}
            boxShadow="none"
            overflow="hidden"
            h="100%"
        >
            <CardBody p={0}>
                <Box p={5}>
                    <HStack
                        justify="space-between"
                        align="flex-start"
                        spacing={4}
                        mb={4}
                    >
                        <VStack align="start" spacing={1} flex={1}>
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="999px"
                                colorScheme={meta.badgeColorScheme}
                                textTransform="uppercase"
                                letterSpacing="0.1em"
                                fontSize="10px"
                                fontWeight="600"
                            >
                                {meta.label}
                            </Badge>
                            <Text
                                fontSize="lg"
                                fontWeight="500"
                                color={isDark ? "grey.100" : "grey.900"}
                                mt={1}
                            >
                                {isStaging
                                    ? "Preview environment"
                                    : "Live environment"}
                            </Text>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.400" : "grey.500"}
                                lineHeight="1.5"
                            >
                                {isStaging
                                    ? "Validate changes before they reach production."
                                    : "Serving the version your users see right now."}
                            </Text>
                        </VStack>

                        <VStack align="end" spacing={1} flexShrink={0}>
                            <Text
                                fontSize="10px"
                                color={isDark ? "grey.500" : "grey.400"}
                                textTransform="uppercase"
                                letterSpacing="0.08em"
                            >
                                Current version
                            </Text>
                            <Text
                                fontSize="4xl"
                                fontWeight="500"
                                color={isDark ? "grey.100" : "grey.900"}
                                lineHeight="1"
                            >
                                {meta.version}
                            </Text>
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="999px"
                                colorScheme={meta.statusColorScheme}
                                fontWeight="500"
                                fontSize="10px"
                            >
                                {meta.status}
                            </Badge>
                        </VStack>
                    </HStack>
                    <SimpleGrid columns={3} spacing={2} mb={4}>
                        <StatCard label="Version" value={meta.version} />
                        <StatCard label="Status" value={meta.status} />
                        <StatCard
                            label="Release"
                            value={isStaging ? "Queued" : "Publicly live"}
                        />
                    </SimpleGrid>
                    {showChanges && (
                        <Box
                            p={4}
                            borderRadius="8px"
                            bg={isDark ? "whiteAlpha.50" : "white"}
                            border="1px solid"
                            borderColor={isDark ? "grey.700" : "grey.200"}
                            mb={4}
                        >
                            <HStack spacing={2} mb={3}>
                                <GitGraph
                                    size={14}
                                    color={isDark ? "#A0AEC0" : "#718096"}
                                />
                                <Text
                                    fontSize="10px"
                                    fontWeight="600"
                                    textTransform="uppercase"
                                    letterSpacing="0.1em"
                                    color={isDark ? "grey.400" : "grey.500"}
                                >
                                    Changes since production
                                </Text>
                            </HStack>

                            <VStack
                                align="stretch"
                                spacing={0}
                                divider={
                                    <Divider
                                        borderColor={
                                            isDark
                                                ? "whiteAlpha.100"
                                                : "grey.100"
                                        }
                                    />
                                }
                            >
                                {stagingChanges.map((change) => (
                                    <HStack
                                        key={change.label}
                                        spacing={3}
                                        py={2}
                                    >
                                        <Badge
                                            colorScheme={change.colorScheme}
                                            fontSize="10px"
                                            px={2}
                                            py={0.5}
                                            borderRadius="999px"
                                            fontWeight="500"
                                            flexShrink={0}
                                        >
                                            {change.label}
                                        </Badge>
                                        <Text
                                            fontSize="xs"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                            lineHeight="1.5"
                                        >
                                            {change.detail}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>

                            <Box
                                mt={3}
                                px={3}
                                py={1.5}
                                borderRadius="4px"
                                border="0.5px solid"
                                borderColor={
                                    isDark ? "whiteAlpha.100" : "grey.200"
                                }
                                bg={isDark ? "grey.800" : "white"}
                                display="inline-flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Text
                                    fontSize="11px"
                                    color={isDark ? "grey.300" : "grey.700"}
                                    fontWeight="500"
                                >
                                    1 prompt update · 1 RAG refresh · 1 tool
                                    added
                                </Text>
                            </Box>
                        </Box>
                    )}

                    {!isStaging && (
                        <Box
                            p={4}
                            borderRadius="8px"
                            bg={isDark ? "whiteAlpha.50" : "white"}
                            border="1px solid"
                            borderColor={isDark ? "grey.700" : "grey.200"}
                            mb={4}
                        >
                            <Text
                                fontSize="10px"
                                fontWeight="600"
                                textTransform="uppercase"
                                letterSpacing="0.1em"
                                color={isDark ? "grey.400" : "grey.500"}
                                mb={3}
                            >
                                Production health
                            </Text>
                            <VStack spacing={2} align="stretch">
                                <HStack justify="space-between" fontSize="xs">
                                    <Text
                                        color={isDark ? "grey.400" : "grey.500"}
                                    >
                                        Uptime
                                    </Text>
                                    <Text
                                        fontWeight="500"
                                        color={isDark ? "grey.100" : "grey.900"}
                                    >
                                        99.98%
                                    </Text>
                                </HStack>
                                <Box
                                    h="3px"
                                    bg={isDark ? "whiteAlpha.100" : "grey.200"}
                                    borderRadius="999px"
                                    overflow="hidden"
                                >
                                    <Box
                                        h="100%"
                                        w="99.98%"
                                        bg="green.400"
                                        borderRadius="999px"
                                    />
                                </Box>
                                <HStack justify="space-between" fontSize="xs">
                                    <Text
                                        color={isDark ? "grey.400" : "grey.500"}
                                    >
                                        Avg response
                                    </Text>
                                    <Text
                                        fontWeight="500"
                                        color={isDark ? "grey.100" : "grey.900"}
                                    >
                                        1.2s
                                    </Text>
                                </HStack>
                                <HStack justify="space-between" fontSize="xs">
                                    <Text
                                        color={isDark ? "grey.400" : "grey.500"}
                                    >
                                        Active users
                                    </Text>
                                    <Text
                                        fontWeight="500"
                                        color={isDark ? "grey.100" : "grey.900"}
                                    >
                                        1,842
                                    </Text>
                                </HStack>
                            </VStack>
                        </Box>
                    )}

                    <Divider
                        borderColor={isDark ? "whiteAlpha.100" : "grey.100"}
                        mb={4}
                    />

                    {/* Actions */}
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={2}
                    >
                        {isStaging ? (
                            <>
                                <Button
                                    size="sm"
                                    colorScheme="orange"
                                    leftIcon={<PlayIcon size={13} />}
                                    fontWeight="500"
                                    flex={1}
                                >
                                    Deploy to staging
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="purple"
                                    leftIcon={<Sparkles size={13} />}
                                    fontWeight="500"
                                    flex={1}
                                >
                                    Open staging chat
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={<RotateCwIcon size={13} />}
                                    fontWeight="500"
                                    color={isDark ? "grey.400" : "grey.600"}
                                    flex={1}
                                >
                                    Promote
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<Sparkles size={13} />}
                                    fontWeight="500"
                                >
                                    Open production chat
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    leftIcon={<FileText size={13} />}
                                    fontWeight="500"
                                >
                                    View logs
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>
            </CardBody>
        </Card>
    );
};

export const DashboardTab = ({ isDark }: { isDark: boolean }) => {
    return (
        <VStack spacing={5} align="stretch">
            <Card
                borderRadius="12px"
                border="0.5px solid"
                borderColor={isDark ? "whiteAlpha.100" : "grey.200"}
                bg={isDark ? "grey.900" : "white"}
                boxShadow="none"
            >
                <CardBody p={2}>
                    <HStack
                        justify="space-between"
                        align="center"
                        flexWrap="wrap"
                        gap={3}
                    >
                        <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2} flexWrap="wrap">
                                <Badge
                                    colorScheme="grey"
                                    px={2}
                                    py={0.5}
                                    borderRadius="999px"
                                    fontSize="10px"
                                    fontWeight="600"
                                >
                                    Deployment
                                </Badge>
                                <Text
                                    fontSize="xl"
                                    fontWeight="500"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    Staging and production,{" "}
                                    <Box
                                        as="span"
                                        color={isDark ? "grey.400" : "grey.500"}
                                        fontWeight="400"
                                    >
                                        clearly separated.
                                    </Box>
                                </Text>
                            </HStack>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.400" : "grey.500"}
                                maxW="700px"
                            >
                                Edit in workflow, test in playground, deploy to
                                staging, validate in staging chat, then promote
                                to production with confidence.
                            </Text>
                        </VStack>

                        <HStack spacing={2}>
                            <Badge
                                colorScheme="orange"
                                px={2}
                                py={0.5}
                                borderRadius="999px"
                                fontSize="10px"
                            >
                                Staging preview
                            </Badge>
                            <Badge
                                colorScheme="green"
                                px={2}
                                py={0.5}
                                borderRadius="999px"
                                fontSize="10px"
                            >
                                Live production
                            </Badge>
                        </HStack>
                    </HStack>
                </CardBody>
            </Card>

            {/* Environment cards */}
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                <EnvironmentCard
                    meta={stagingMeta}
                    tone="staging"
                    showChanges
                    isDark={isDark}
                />
                <EnvironmentCard
                    meta={productionMeta}
                    tone="production"
                    isDark={isDark}
                />
            </SimpleGrid>
        </VStack>
    );
};
