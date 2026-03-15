import {
    Box,
    Text,
    Badge,
    IconButton,
    Grid,
    VStack,
    HStack,
    Button,
    Modal,
    useDisclosure,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
} from "@chakra-ui/react";
import { useCopyToClipboard } from "hooks/useCopyToClipboard";
import {
    ClockIcon,
    CopyIcon,
    PauseIcon,
    PlayIcon,
    RotateCwIcon,
} from "lucide-react";
import { useState } from "react";

enum DeploymentStatus {
    LIVE = "live",
    DRAFT = "draft",
    OFFLINE = "offline",
}

export const DashboardTab = ({ isDark }: { isDark: boolean }) => {

    const { copyToClipboard } = useCopyToClipboard();
    const getStatusConfig = (status: DeploymentStatus) => {
        const configs = {
            [DeploymentStatus.LIVE]: {
                color: "green",
                icon: "🟢",
                label: "Live",
                bgColor: isDark ? "green.900" : "green.50",
                textColor: "green.500",
            },
            [DeploymentStatus.DRAFT]: {
                color: "yellow",
                icon: "🟡",
                label: "Draft",
                bgColor: isDark ? "yellow.900" : "yellow.50",
                textColor: "yellow.500",
            },
            [DeploymentStatus.OFFLINE]: {
                color: "red",
                icon: "🔴",
                label: "Offline",
                bgColor: isDark ? "red.900" : "red.50",
                textColor: "red.500",
            },
        };
        return configs[status];
    };

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [deploymentStatus, _setDeploymentStatus] = useState<DeploymentStatus>(
        DeploymentStatus.OFFLINE,
    );

    const statusConfig = getStatusConfig(deploymentStatus);
    /*----------------------MOCK DATA----------------------*/
    const lastDeployment = "12 Feb 2026, 14:32";
    const deploymentId = "xyz-123";
    const chatUrl = `https://app.genrag.ai/chat/${deploymentId}`;
    const apiEndpoint = `/v1/chat/${deploymentId}`;
    const deploymentHistory = [
        {
            version: "v1.2",
            date: "12 Feb 2026, 14:32",
            status: "current",
            author: "John Doe",
            changes: "Updated model to Claude Sonnet 4",
        },
        {
            version: "v1.1",
            date: "7 Feb 2026, 10:15",
            status: "previous",
            author: "Jane Smith",
            changes: "Fixed response latency issues",
        },
        {
            version: "v1.0",
            date: "3 Feb 2026, 09:00",
            status: "previous",
            author: "John Doe",
            changes: "Initial deployment",
        },
    ];
    /*----------------------END OF MOCK DATA----------------------*/

    return (
        <VStack spacing={6} align="stretch">
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg={isDark ? "grey.975" : "white"}>
                    <ModalHeader>Assistant Deployment</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color={isDark ? "grey.100" : "grey.900"}
                            >
                                Describe changes and updates to the assistant
                            </Text>
                        </VStack>
                        <Input
                            mt={2}
                            placeholder="Deployment Description"
                            w="100%"
                        />
                        <Text
                            mt={2}
                            fontSize="sm"
                            color={isDark ? "grey.400" : "grey.600"}
                        >
                            It will be visible in the deployment history.
                        </Text>
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            colorScheme="grey"
                        >
                            Cancel
                        </Button>
                        <Button onClick={onClose} colorScheme="green">
                            Deploy Assistant
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Box
                p={2}
                pb={4}
                bg={isDark ? "grey.975" : "white"}
                borderBottom="1px solid"
                borderColor={isDark ? "grey.700" : "grey.200"}
            >
                <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={3}>
                        <HStack spacing={3}>
                            <Text
                                fontSize="xl"
                                fontWeight="700"
                                color={isDark ? "grey.100" : "grey.900"}
                            >
                                Assistant Deployment
                            </Text>
                            <Badge
                                px={3}
                                py={1}
                                borderRadius="999px"
                                bg={statusConfig.bgColor}
                                color={statusConfig.textColor}
                                fontWeight="600"
                                fontSize="sm"
                            >
                                {statusConfig.icon} {statusConfig.label}
                            </Badge>
                        </HStack>
                        <Text
                            fontSize="sm"
                            color={isDark ? "grey.400" : "grey.600"}
                        >
                            Deploy and manage your production assistant
                        </Text>
                        <HStack
                            spacing={2}
                            color={isDark ? "grey.500" : "grey.500"}
                        >
                            <ClockIcon size={14} />
                            <Text fontSize="xs">
                                Last deployed: {lastDeployment}
                            </Text>
                        </HStack>
                    </VStack>

                    <HStack spacing={3}>
                        {deploymentStatus === DeploymentStatus.LIVE && (
                            <>
                                <Button
                                    leftIcon={<RotateCwIcon size={16} />}
                                    size="md"
                                    variant="outline"
                                    borderColor={
                                        isDark ? "grey.600" : "grey.300"
                                    }
                                    color={isDark ? "grey.300" : "grey.700"}
                                    _hover={{
                                        bg: isDark ? "grey.800" : "grey.100",
                                    }}
                                    onClick={onOpen}
                                >
                                    Redeploy
                                </Button>
                                <Button
                                    leftIcon={<PauseIcon size={16} />}
                                    size="md"
                                    variant="outline"
                                    colorScheme="red"
                                    borderColor={isDark ? "red.700" : "red.300"}
                                    color={isDark ? "red.400" : "red.600"}
                                    _hover={{
                                        bg: isDark ? "red.900" : "red.50",
                                    }}
                                >
                                    Pause
                                </Button>
                            </>
                        )}
                        {deploymentStatus !== DeploymentStatus.LIVE && (
                            <Button
                                leftIcon={<PlayIcon size={16} />}
                                size="md"
                                colorScheme="green"
                                bg="green.500"
                                color="white"
                                _hover={{ bg: "green.600" }}
                                onClick={onOpen}
                            >
                                Deploy
                            </Button>
                        )}
                    </HStack>
                </HStack>
            </Box>

            <Grid
                templateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                gap={0}
                p={2}
                pt={0}
            >
                <VStack
                    align="start"
                    spacing={1}
                    p={4}
                    borderRight="1px solid"
                    borderColor={isDark ? "grey.800" : "grey.100"}
                >
                    <Text
                        fontSize="xs"
                        fontWeight="600"
                        color={isDark ? "grey.500" : "grey.500"}
                        textTransform="uppercase"
                        letterSpacing="wide"
                    >
                        Deployment ID
                    </Text>
                    <HStack>
                        <Text
                            fontSize="md"
                            fontWeight="600"
                            color={isDark ? "grey.100" : "grey.900"}
                            fontFamily="mono"
                        >
                            {deploymentId}
                        </Text>
                        <IconButton
                            icon={<CopyIcon size={14} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => copyToClipboard(deploymentId)}
                            aria-label="Copy ID"
                        />
                    </HStack>
                </VStack>

                <VStack
                    align="start"
                    spacing={1}
                    p={4}
                    borderRight="1px solid"
                    borderColor={isDark ? "grey.800" : "grey.100"}
                >
                    <Text
                        fontSize="xs"
                        fontWeight="600"
                        color={isDark ? "grey.500" : "grey.500"}
                        textTransform="uppercase"
                        letterSpacing="wide"
                    >
                        Environment
                    </Text>
                    <Text
                        fontSize="md"
                        fontWeight="600"
                        color={isDark ? "grey.100" : "grey.900"}
                    >
                        Production
                    </Text>
                </VStack>

                <VStack
                    align="start"
                    spacing={1}
                    p={4}
                    borderRight="1px solid"
                    borderColor={isDark ? "grey.800" : "grey.100"}
                >
                    <Text
                        fontSize="xs"
                        fontWeight="600"
                        color={isDark ? "grey.500" : "grey.500"}
                        textTransform="uppercase"
                        letterSpacing="wide"
                    >
                        Workflow Version
                    </Text>
                    <Text
                        fontSize="md"
                        fontWeight="600"
                        color={isDark ? "grey.100" : "grey.900"}
                    >
                        v1.2
                    </Text>
                </VStack>

                <VStack align="start" spacing={1} p={4}>
                    <Text
                        fontSize="xs"
                        fontWeight="600"
                        color={isDark ? "grey.500" : "grey.500"}
                        textTransform="uppercase"
                        letterSpacing="wide"
                    >
                        LLM Model
                    </Text>
                    <Text
                        fontSize="md"
                        fontWeight="600"
                        color={isDark ? "grey.100" : "grey.900"}
                    >
                        Claude Sonnet 4
                    </Text>
                </VStack>
            </Grid>

            <Grid
                templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                gap={6}
            >
                <VStack spacing={6} align="stretch">
                    <VStack spacing={4} align="stretch">
                        <Text
                            fontSize="lg"
                            fontWeight="700"
                            color={isDark ? "grey.100" : "grey.900"}
                        >
                            Access & Integration
                        </Text>

                        <VStack spacing={2} align="stretch">
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color={isDark ? "grey.300" : "grey.700"}
                            >
                                Chat URL
                            </Text>
                            <HStack
                                p={3}
                                bg={isDark ? "grey.900" : "white"}
                                borderRadius="8px"
                                border="1px solid"
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            >
                                <Text
                                    fontSize="sm"
                                    fontFamily="mono"
                                    color={isDark ? "grey.300" : "grey.700"}
                                    flex={1}
                                    isTruncated
                                >
                                    {chatUrl}
                                </Text>
                                <IconButton
                                    icon={<CopyIcon size={14} />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(chatUrl)}
                                    aria-label="Copy URL"
                                />
                            </HStack>
                        </VStack>

                        <VStack spacing={2} align="stretch">
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color={isDark ? "grey.300" : "grey.700"}
                            >
                                API Endpoint
                            </Text>
                            <HStack
                                p={3}
                                bg={isDark ? "grey.900" : "white"}
                                borderRadius="8px"
                                border="1px solid"
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            >
                                <VStack align="start" spacing={0} flex={1}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="600"
                                        color={isDark ? "grey.500" : "grey.500"}
                                    >
                                        POST
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        fontFamily="mono"
                                        color={isDark ? "grey.300" : "grey.700"}
                                    >
                                        {apiEndpoint}
                                    </Text>
                                </VStack>
                                <IconButton
                                    icon={<CopyIcon size={14} />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(apiEndpoint)}
                                    aria-label="Copy endpoint"
                                />
                            </HStack>
                        </VStack>
                    </VStack>
                </VStack>
                <VStack spacing={6} align="stretch">
                    <VStack spacing={4} align="stretch">
                        <Text
                            fontSize="lg"
                            fontWeight="700"
                            color={isDark ? "grey.100" : "grey.900"}
                        >
                            Recent Deployments
                        </Text>
                        <VStack spacing={2} align="stretch">
                            {deploymentHistory
                                .slice(0, 3)
                                .map((deploy, idx) => (
                                    <HStack
                                        key={idx}
                                        p={3}
                                        bg={
                                            deploy.status === "current"
                                                ? isDark
                                                    ? "green.950"
                                                    : "green.50"
                                                : isDark
                                                  ? "grey.900"
                                                  : "white"
                                        }
                                        borderRadius="8px"
                                        border="1px solid"
                                        borderColor={
                                            deploy.status === "current"
                                                ? "green.500"
                                                : isDark
                                                  ? "grey.700"
                                                  : "grey.200"
                                        }
                                        justify="space-between"
                                    >
                                        <HStack spacing={3}>
                                            <Box
                                                w="8px"
                                                h="8px"
                                                borderRadius="full"
                                                bg={
                                                    deploy.status === "current"
                                                        ? "green.500"
                                                        : isDark
                                                          ? "grey.600"
                                                          : "grey.400"
                                                }
                                            />
                                            <VStack align="start" spacing={0}>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color={
                                                        isDark
                                                            ? "grey.100"
                                                            : "grey.900"
                                                    }
                                                >
                                                    {deploy.version}
                                                </Text>
                                                <Text
                                                    fontSize="xs"
                                                    color={
                                                        isDark
                                                            ? "grey.400"
                                                            : "grey.600"
                                                    }
                                                >
                                                    {deploy.date.split(",")[0]}
                                                </Text>
                                            </VStack>
                                        </HStack>

                                        {deploy.status === "current" ? (
                                            <Badge
                                                colorScheme="green"
                                                fontSize="xs"
                                            >
                                                Current
                                            </Badge>
                                        ) : (
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                color={
                                                    isDark
                                                        ? "grey.400"
                                                        : "grey.600"
                                                }
                                                _hover={{
                                                    bg: isDark
                                                        ? "grey.800"
                                                        : "grey.100",
                                                }}
                                            >
                                                Rollback
                                            </Button>
                                        )}
                                    </HStack>
                                ))}
                        </VStack>
                    </VStack>
                </VStack>
            </Grid>
        </VStack>
    );
};
