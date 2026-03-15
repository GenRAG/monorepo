import {
    VStack,
    HStack,
    Text,
    Button,
    Stack,
    Divider,
    Card,
    CardBody,
    Switch,
    Grid,
} from "@chakra-ui/react";
import { DownloadIcon } from "lucide-react";
import { useState } from "react";

export const Settings = ({ isDark }: { isDark: boolean }) => {
    const [dataRetention, setDataRetention] = useState(true);
    const [logsEnabled, setLogsEnabled] = useState(true);

    return (
        <VStack w="100%" spacing={6} align="stretch">
            <Grid w="100%" gap={2}>
                <Card
                    w="100%"
                    bg={isDark ? "grey.950" : "white"}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={isDark ? "grey.700" : "grey.200"}
                >
                    <CardBody p={0}>
                        <VStack spacing={4} align="stretch">
                            <Text
                                fontSize="lg"
                                fontWeight="700"
                                color={isDark ? "grey.100" : "grey.900"}
                            >
                                Security & Compliance
                            </Text>

                            <VStack spacing={3} align="stretch">
                                <HStack
                                    justify="space-between"
                                    p={3}
                                    bg={isDark ? "grey.900" : "green.50"}
                                    border="1px solid"
                                    borderColor={
                                        isDark ? "grey.700" : "green.200"
                                    }
                                    borderRadius="8px"
                                >
                                    <VStack align="start" spacing={0}>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color={
                                                isDark ? "grey.100" : "grey.900"
                                            }
                                        >
                                            Data Retention Policy
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                        >
                                            Store conversations for 30 days
                                        </Text>
                                    </VStack>
                                    <Switch
                                        colorScheme="green"
                                        isChecked={dataRetention}
                                        onChange={(e) =>
                                            setDataRetention(e.target.checked)
                                        }
                                    />
                                </HStack>

                                <HStack
                                    justify="space-between"
                                    p={3}
                                    bg={isDark ? "grey.900" : "green.50"}
                                    border="1px solid"
                                    borderColor={
                                        isDark ? "grey.700" : "green.200"
                                    }
                                    borderRadius="8px"
                                >
                                    <VStack align="start" spacing={0}>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color={
                                                isDark ? "grey.100" : "grey.900"
                                            }
                                        >
                                            Logs Enabled
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                        >
                                            Track all API requests
                                        </Text>
                                    </VStack>
                                    <Switch
                                        colorScheme="green"
                                        isChecked={logsEnabled}
                                        onChange={(e) =>
                                            setLogsEnabled(e.target.checked)
                                        }
                                    />
                                </HStack>

                                <HStack
                                    justify="space-between"
                                    p={3}
                                    bg={isDark ? "grey.900" : "green.50"}
                                    border="1px solid"
                                    borderColor={
                                        isDark ? "grey.700" : "green.200"
                                    }
                                    borderRadius="8px"
                                >
                                    <VStack align="start" spacing={0}>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color={
                                                isDark ? "grey.100" : "grey.900"
                                            }
                                        >
                                            Anonymization
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                        >
                                            Remove PII from stored data
                                        </Text>
                                    </VStack>
                                    <Switch colorScheme="green" />
                                </HStack>

                                <HStack
                                    justify="space-between"
                                    p={3}
                                    bg={isDark ? "grey.900" : "green.50"}
                                    border="1px solid"
                                    borderColor={
                                        isDark ? "grey.700" : "green.200"
                                    }
                                    borderRadius="8px"
                                >
                                    <VStack align="start" spacing={0}>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color={
                                                isDark ? "grey.100" : "grey.900"
                                            }
                                        >
                                            GDPR Compliance
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                        >
                                            Enable data export on request
                                        </Text>
                                    </VStack>
                                    <Switch
                                        colorScheme="green"
                                        defaultChecked
                                    />
                                </HStack>
                            </VStack>

                            <Divider
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            />

                            <VStack
                                spacing={2}
                                minW="300px"
                                maxW="300px"
                                align="start"
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color={isDark ? "grey.300" : "grey.700"}
                                >
                                    Data Export
                                </Text>
                                <Button
                                    w="100%"
                                    leftIcon={<DownloadIcon size={16} />}
                                    size="sm"
                                    variant="outline"
                                    borderColor={
                                        isDark ? "grey.600" : "grey.300"
                                    }
                                    color={isDark ? "grey.300" : "grey.700"}
                                    _hover={{
                                        bg: isDark ? "grey.800" : "grey.100",
                                    }}
                                >
                                    Export All Conversations
                                </Button>
                                <Button
                                    w="100%"
                                    leftIcon={<DownloadIcon size={16} />}
                                    size="sm"
                                    variant="outline"
                                    borderColor={
                                        isDark ? "grey.600" : "grey.300"
                                    }
                                    color={isDark ? "grey.300" : "grey.700"}
                                    _hover={{
                                        bg: isDark ? "grey.800" : "grey.100",
                                    }}
                                >
                                    Export Logs
                                </Button>
                            </VStack>
                            <Stack direction="row" spacing={2} justify="end">
                                <Button
                                    colorScheme="green"
                                    size="sm"
                                    mt={4}
                                    maxW="200px"
                                >
                                    Save Changes
                                </Button>
                            </Stack>
                        </VStack>
                    </CardBody>
                </Card>
            </Grid>
            <Card
                p={2}
                bg={isDark ? "grey.950" : "white"}
                borderRadius="16px"
                border="1px solid"
                borderColor={isDark ? "red.700" : "red.200"}
            >
                <CardBody p={0}>
                    <VStack spacing={4} align="stretch">
                        <Text
                            fontSize="lg"
                            fontWeight="700"
                            color={isDark ? "red.300" : "red.700"}
                        >
                            Danger Zone
                        </Text>

                        <HStack
                            justify="space-between"
                            p={3}
                            bg={isDark ? "grey.900" : "white"}
                            borderRadius="8px"
                            border="1px solid"
                            borderColor={isDark ? "grey.700" : "grey.200"}
                        >
                            <VStack align="start" spacing={0}>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    Delete All Conversation Data
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color={isDark ? "grey.400" : "grey.600"}
                                >
                                    Permanently remove all stored conversations
                                </Text>
                            </VStack>
                            <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                            >
                                Delete Data
                            </Button>
                        </HStack>

                        <HStack
                            justify="space-between"
                            p={3}
                            bg={isDark ? "grey.900" : "white"}
                            borderRadius="8px"
                            border="1px solid"
                            borderColor={isDark ? "grey.700" : "grey.200"}
                        >
                            <VStack align="start" spacing={0}>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    Delete Deployment
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color={isDark ? "grey.400" : "grey.600"}
                                >
                                    Permanently delete this deployment and all
                                    its data
                                </Text>
                            </VStack>
                            <Button size="sm" colorScheme="red">
                                Delete Deployment
                            </Button>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
};
