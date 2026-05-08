import {
    Box,
    HStack,
    Icon,
    Skeleton,
    Text,
    VStack,
    useColorModeValue,
    type BoxProps,
} from "@chakra-ui/react";
import { Bot, Zap } from "lucide-react";
import { AGENTS, type AgentEntry } from "pages/Dashboard/data";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { AgentStatus } from "types/deployment/deployment";

const STATUS_DOT: Record<AgentStatus, string> = {
    PRODUCTION: "#12B98C",
    DEVELOPMENT: "#6B7280",
};

const STATUS_LABEL: Record<AgentStatus, string> = {
    PRODUCTION: "Production",
    DEVELOPMENT: "Dev",
};

const AgentRow = ({ agent }: { agent: AgentEntry }) => {
    const divider = useColorModeValue("grey.100", "grey.800");
    const hoverBg = useColorModeValue("grey.50", "grey.800");
    const avatarBg = useColorModeValue("grey.100", "grey.750");
    const nameCol = useColorModeValue("grey.900", "grey.100");
    const metaCol = useColorModeValue("grey.500", "grey.400");
    const normalErrCol = useColorModeValue("grey.700", "grey.300");
    const errCol = agent.errWarning ? "#F59E0B" : normalErrCol;

    const metrics = [
        { val: agent.conv, label: "CONV" },
        { val: agent.p95, label: "P95" },
        { val: agent.err, label: "ERR", warn: agent.errWarning },
    ];

    return (
        <HStack
            spacing={3}
            p={2}
            borderBottom="1px solid"
            borderColor={divider}
            _hover={{ bg: hoverBg, cursor: "pointer" }}
            borderRadius="6px"
            transition="background 0.1s"
        >
            <Box
                w="32px"
                h="32px"
                borderRadius="6px"
                bg={avatarBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                <Text
                    fontSize="10px"
                    fontWeight="700"
                    color={nameCol}
                    letterSpacing="0.04em"
                >
                    {agent.initials}
                </Text>
            </Box>
            <VStack align="start" spacing={0} flex={1} minW={0}>
                <Text
                    fontSize="13px"
                    fontWeight="600"
                    color={nameCol}
                    noOfLines={1}
                >
                    {agent.name}
                </Text>
                <HStack spacing={1.5}>
                    <Box
                        w="5px"
                        h="5px"
                        borderRadius="full"
                        bg={STATUS_DOT[agent.status]}
                        flexShrink={0}
                    />
                    <Text fontSize="11px" color={metaCol}>
                        {STATUS_LABEL[agent.status]} · {agent.version}
                    </Text>
                </HStack>
            </VStack>
            {metrics.map(({ val, label, warn }) => (
                <VStack key={label} align="center" spacing={0} minW="38px">
                    <Text
                        fontSize="13px"
                        fontWeight="600"
                        color={warn ? errCol : nameCol}
                        fontFamily="mono"
                    >
                        {val}
                    </Text>
                    <Text
                        fontSize="10px"
                        color={metaCol}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                    >
                        {label}
                    </Text>
                </VStack>
            ))}
        </HStack>
    );
};

interface AgentsCardProps extends BoxProps {
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const AgentsCard = ({
    isEmpty = false,
    isLoading = false,
    ...props
}: AgentsCardProps) => {
    const cardBg = useColorModeValue("white", "grey.850");
    const border = useColorModeValue("grey.100", "grey.800");
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const skeletonStart = useColorModeValue("grey.100", "grey.800");
    const skeletonEnd = useColorModeValue("grey.200", "grey.700");
    const skeletonProps = { startColor: skeletonStart, endColor: skeletonEnd };

    const activeCount = AGENTS.filter(
        (a) =>
            a.status === AgentStatus.PRODUCTION ||
            a.status === AgentStatus.DEVELOPMENT,
    ).length;

    if (isLoading) {
        return (
            <Box
                bg={cardBg}
                border="1px solid"
                borderColor={border}
                borderRadius="12px"
                {...props}
            >
                <HStack
                    justify="space-between"
                    borderBottom="1px solid"
                    borderColor={border}
                    p={4}
                >
                    <HStack spacing={2}>
                        <Skeleton
                            {...skeletonProps}
                            h="14px"
                            w="14px"
                            borderRadius="3px"
                        />
                        <Skeleton
                            {...skeletonProps}
                            h="14px"
                            w="60px"
                            borderRadius="4px"
                        />
                    </HStack>
                </HStack>
                <VStack spacing={0} align="stretch" p={2}>
                    {[...Array(11)].map((_, i) => (
                        <HStack key={i} spacing={3} p={2}>
                            <Skeleton
                                {...skeletonProps}
                                w="32px"
                                h="32px"
                                borderRadius="6px"
                                flexShrink={0}
                            />
                            <VStack align="start" spacing={1} flex={1} minW={0}>
                                <Skeleton
                                    {...skeletonProps}
                                    h="13px"
                                    w="120px"
                                    borderRadius="4px"
                                />
                                <Skeleton
                                    {...skeletonProps}
                                    h="11px"
                                    w="80px"
                                    borderRadius="4px"
                                />
                            </VStack>
                            {[0, 1, 2].map((j) => (
                                <VStack
                                    key={j}
                                    align="center"
                                    spacing={1}
                                    minW="38px"
                                >
                                    <Skeleton
                                        {...skeletonProps}
                                        h="13px"
                                        w="28px"
                                        borderRadius="4px"
                                    />
                                    <Skeleton
                                        {...skeletonProps}
                                        h="10px"
                                        w="22px"
                                        borderRadius="3px"
                                    />
                                </VStack>
                            ))}
                        </HStack>
                    ))}
                </VStack>
            </Box>
        );
    }

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            {...props}
        >
            <HStack
                justify="space-between"
                borderBottom="1px solid"
                borderColor={border}
                p={4}
            >
                <HStack spacing={2}>
                    <Icon as={Zap} boxSize={3.5} color={textSecondary} />
                    <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                        Agents
                    </Text>
                    <Text fontSize="sm" color={textSecondary}>
                        {activeCount} actifs
                    </Text>
                </HStack>
            </HStack>
            {isEmpty ? (
                <CardEmptyState
                    icon={Bot}
                    title="Aucun agent actif"
                    description="Créez votre premier agent pour commencer."
                />
            ) : (
                <VStack spacing={0} align="stretch">
                    {AGENTS.map((agent) => (
                        <AgentRow key={agent.initials} agent={agent} />
                    ))}
                </VStack>
            )}
        </Box>
    );
};
