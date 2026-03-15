import {
    VStack,
    HStack,
    Text,
    Button,
    Box,
    Table,
    Thead,
    Tr,
    Td,
    Tbody,
    IconButton,
    Badge,
    RadioGroup,
    Stack,
    Divider,
    Input,
    Th,
} from "@chakra-ui/react";
import {
    GlobeIcon,
    LockIcon,
    KeyIcon,
    TrashIcon,
    PlusIcon,
} from "lucide-react";
import { useState } from "react";

enum UserRole {
    ADMIN = "Admin",
    VIEWER = "Viewer",
}

interface WhitelistedEmail {
    email: string;
    role: UserRole;
}

export const AccessControl = ({ isDark }: { isDark: boolean }) => {
    const [accessMode, setAccessMode] = useState("public");
    const [newEmail, setNewEmail] = useState("");
    const [whitelistedEmails, setWhitelistedEmails] = useState<
        WhitelistedEmail[]
    >([
        { email: "alice@company.com", role: UserRole.ADMIN },
        { email: "bob@company.com", role: UserRole.VIEWER },
    ]);

    const addEmail = () => {
        if (newEmail && newEmail.includes("@")) {
            setWhitelistedEmails([
                ...whitelistedEmails,
                { email: newEmail, role: UserRole.VIEWER },
            ]);
            setNewEmail("");
        }
    };

    const removeEmail = (email: string) => {
        setWhitelistedEmails(
            whitelistedEmails.filter((item) => item.email !== email),
        );
    };

    return (
        <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
                <LockIcon size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text
                    fontSize="lg"
                    fontWeight="700"
                    color={isDark ? "grey.100" : "grey.900"}
                >
                    Access Control
                </Text>
            </HStack>

            <RadioGroup value={accessMode} onChange={setAccessMode}>
                <Stack spacing={3}>
                    <HStack
                        p={3}
                        borderRadius="8px"
                        border="1px solid"
                        borderColor={
                            accessMode === "public"
                                ? "green.500"
                                : isDark
                                  ? "grey.700"
                                  : "grey.200"
                        }
                        bg={
                            accessMode === "public"
                                ? isDark
                                    ? "green.950"
                                    : "green.50"
                                : "transparent"
                        }
                        cursor="pointer"
                        onClick={() => setAccessMode("public")}
                    >
                        <VStack align="start" spacing={0} flex={1}>
                            <HStack>
                                <GlobeIcon size={16} />
                                <Text
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    Public
                                </Text>
                            </HStack>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.400" : "grey.600"}
                            >
                                Anyone with the link can access
                            </Text>
                        </VStack>
                    </HStack>

                    <HStack
                        p={3}
                        borderRadius="8px"
                        border="1px solid"
                        borderColor={
                            accessMode === "private"
                                ? "green.500"
                                : isDark
                                  ? "grey.700"
                                  : "grey.200"
                        }
                        bg={
                            accessMode === "private"
                                ? isDark
                                    ? "green.950"
                                    : "green.50"
                                : "transparent"
                        }
                        cursor="pointer"
                        onClick={() => setAccessMode("private")}
                    >
                        <VStack align="start" spacing={0} flex={1}>
                            <HStack>
                                <LockIcon size={16} />
                                <Text
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    Private
                                </Text>
                            </HStack>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.400" : "grey.600"}
                            >
                                Only whitelisted emails
                            </Text>
                        </VStack>
                    </HStack>

                    <HStack
                        p={3}
                        borderRadius="8px"
                        border="1px solid"
                        borderColor={
                            accessMode === "api"
                                ? "green.500"
                                : isDark
                                  ? "grey.700"
                                  : "grey.200"
                        }
                        bg={
                            accessMode === "api"
                                ? isDark
                                    ? "green.950"
                                    : "green.50"
                                : "transparent"
                        }
                        cursor="pointer"
                        onClick={() => setAccessMode("api")}
                    >
                        <VStack align="start" spacing={0} flex={1}>
                            <HStack>
                                <KeyIcon size={16} />
                                <Text
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    API Only
                                </Text>
                            </HStack>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.400" : "grey.600"}
                            >
                                Programmatic access only
                            </Text>
                        </VStack>
                    </HStack>
                </Stack>
            </RadioGroup>

            {accessMode === "private" && (
                <VStack spacing={3} align="stretch" mt={2}>
                    <Divider borderColor={isDark ? "grey.700" : "grey.200"} />
                    <VStack spacing={1} align="stretch">
                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            color={isDark ? "grey.300" : "grey.700"}
                        >
                            Whitelisted Emails
                        </Text>
                        <Text
                            fontSize="xs"
                            color={isDark ? "grey.400" : "grey.600"}
                        >
                            Add emails to the whitelist to grant access to the
                            assistant.
                        </Text>
                    </VStack>

                    <HStack>
                        <Input
                            placeholder="email@company.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addEmail()}
                            size="md"
                            bg={isDark ? "grey.900" : "white"}
                            borderColor={isDark ? "grey.700" : "grey.200"}
                        />
                        <Button size="lg" variant="primary" onClick={addEmail}>
                            <PlusIcon size={32} />
                        </Button>
                    </HStack>

                    <Box
                        borderRadius="8px"
                        border="1px solid"
                        borderColor={isDark ? "grey.700" : "grey.200"}
                        overflow="hidden"
                    >
                        <Table variant="simple" size="sm">
                            <Thead bg={isDark ? "grey.900" : "white"}>
                                <Tr>
                                    <Th
                                        borderColor={
                                            isDark ? "grey.700" : "grey.200"
                                        }
                                    >
                                        Email
                                    </Th>
                                    <Th
                                        borderColor={
                                            isDark ? "grey.700" : "grey.200"
                                        }
                                    >
                                        Role
                                    </Th>
                                    <Th
                                        borderColor={
                                            isDark ? "grey.700" : "grey.200"
                                        }
                                    ></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {whitelistedEmails.map((item, idx) => (
                                    <Tr
                                        key={idx}
                                        _hover={{
                                            bg: isDark ? "grey.900" : "white",
                                        }}
                                    >
                                        <Td
                                            borderColor={
                                                isDark ? "grey.800" : "grey.100"
                                            }
                                        >
                                            {item.email}
                                        </Td>
                                        <Td
                                            borderColor={
                                                isDark ? "grey.800" : "grey.100"
                                            }
                                        >
                                            <Badge
                                                colorScheme={
                                                    item.role === "Admin"
                                                        ? "purple"
                                                        : "blue"
                                                }
                                                fontSize="xs"
                                            >
                                                {item.role}
                                            </Badge>
                                        </Td>
                                        <Td
                                            borderColor={
                                                isDark ? "grey.800" : "grey.100"
                                            }
                                        >
                                            <IconButton
                                                icon={<TrashIcon size={14} />}
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() =>
                                                    removeEmail(item.email)
                                                }
                                                aria-label="Remove email"
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </VStack>
            )}
        </VStack>
    );
};
