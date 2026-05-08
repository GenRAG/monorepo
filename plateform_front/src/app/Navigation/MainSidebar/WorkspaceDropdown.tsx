import {
    Box,
    Divider,
    HStack,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import {
    Check,
    ChevronDown,
    Globe,
    Plus,
    Settings,
    UserPlus,
} from "lucide-react";
import Button from "components/System/Atoms/Button";
import { Workspace } from "types/workspace";

const AVATAR_COLORS = [
    "#E85D75",
    "#6C7FD8",
    "#F0A500",
    "#3AAFA9",
    "#8B5CF6",
    "#10B981",
    "#F97316",
    "#EC4899",
];

function colorForString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface WorkspaceAvatarProps {
    name: string;
    size?: "sm" | "md";
}

const WorkspaceAvatar = ({ name, size = "md" }: WorkspaceAvatarProps) => {
    const dim = size === "sm" ? "26px" : "34px";
    const fs = size === "sm" ? "11px" : "14px";
    const color = colorForString(name);
    return (
        <Box
            w={dim}
            h={dim}
            minW={dim}
            borderRadius="8px"
            bg={color}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            fontSize={fs}
            color="white"
            flexShrink={0}
        >
            {name.charAt(0).toUpperCase()}
        </Box>
    );
};

interface WorkspaceDropdownProps {
    workspaces: Workspace[];
    selectedId: string;
    onSelect: (id: string) => void;
}

const WorkspaceDropdown = ({
    workspaces,
    selectedId,
    onSelect,
}: WorkspaceDropdownProps) => {
    const { isOpen, onClose, onToggle } = useDisclosure();

    const selectedWorkspace =
        workspaces.find((w) => w.id === selectedId) ?? workspaces[0];

    const triggerBg = useColorModeValue("whiteAlpha.100", "whiteAlpha.50");
    const triggerHoverBg = useColorModeValue(
        "blackAlpha.100",
        "whiteAlpha.100",
    );
    const popoverBg = useColorModeValue("white", "#1a1a1a");
    const popoverBorder = useColorModeValue("grey.100", "#333");
    const headingColor = useColorModeValue("grey.400", "grey.500");
    const nameColor = useColorModeValue("grey.900", "white");
    const titleColor = useColorModeValue("grey.900", "white");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const itemHoverBg = useColorModeValue("grey.50", "whiteAlpha.100");
    const dividerColor = useColorModeValue("grey.100", "#2a2a2a");
    const actionColor = useColorModeValue("grey.700", "grey.300");
    const activeCheckColor = useColorModeValue("green.500", "green.300");

    const handleSelect = (id: string) => {
        onSelect(id);
        onClose();
    };

    return (
        <Popover
            isOpen={isOpen}
            onClose={onClose}
            placement="bottom-start"
            gutter={4}
        >
            <PopoverTrigger>
                <HStack
                    m={2}
                    px={2}
                    py={2}
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="grey.600"
                    bg={triggerBg}
                    cursor="pointer"
                    _hover={{ bg: triggerHoverBg }}
                    transition="background 0.15s"
                    justify="space-between"
                    onClick={onToggle}
                    role="button"
                    aria-label="Switch workspace"
                >
                    <HStack spacing={2} minW={0}>
                        {selectedWorkspace && (
                            <WorkspaceAvatar
                                name={selectedWorkspace.name}
                                size="sm"
                            />
                        )}
                        <Text
                            fontSize="13px"
                            fontWeight="500"
                            color={titleColor}
                            noOfLines={1}
                            isTruncated
                        >
                            {selectedWorkspace?.name ?? "Select workspace"}
                        </Text>
                    </HStack>
                    <Box flexShrink={0} color={subColor}>
                        <ChevronDown size={14} />
                    </Box>
                </HStack>
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    bg={popoverBg}
                    border="1px solid"
                    borderColor={popoverBorder}
                    borderRadius="12px"
                    boxShadow="0 8px 32px rgba(0,0,0,0.24)"
                    w="260px"
                    _focus={{ outline: "none" }}
                    overflow="hidden"
                    mt={2}
                >
                    <PopoverBody p={0}>
                        {selectedWorkspace && (
                            <Box px={3} pt={3} pb={2}>
                                <HStack spacing={3} mb={2}>
                                    <WorkspaceAvatar
                                        name={selectedWorkspace.name}
                                        size="md"
                                    />
                                    <VStack align="start" spacing={0} minW={0}>
                                        <Text
                                            fontSize="13px"
                                            fontWeight="600"
                                            color={nameColor}
                                            isTruncated
                                            noOfLines={1}
                                        >
                                            {selectedWorkspace.name}
                                        </Text>
                                        <Text fontSize="11px" color={subColor}>
                                            {/*selectedWorkspace.agentsCount ?? 0}{" "}
                                            agent
                                            {(selectedWorkspace.agentsCount ??
                                                0) !== 1
                                                ? "s"
                                                : ""*/}
                                        </Text>
                                    </VStack>
                                </HStack>

                                <HStack spacing={2}>
                                    <Button
                                        size="xs"
                                        variant="primary"
                                        leftIcon={Settings}
                                        flex={1}
                                        fontSize="11px"
                                    >
                                        Settings
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="primary"
                                        leftIcon={UserPlus}
                                        flex={1}
                                        fontSize="11px"
                                    >
                                        Invite
                                    </Button>
                                </HStack>
                            </Box>
                        )}

                        <Divider borderColor={dividerColor} />

                        <Box px={2} py={2}>
                            <Text
                                px={2}
                                pb={1}
                                fontSize="10px"
                                fontWeight="600"
                                textTransform="uppercase"
                                letterSpacing="0.6px"
                                color={headingColor}
                            >
                                All workspaces
                            </Text>

                            <VStack spacing={0} align="stretch">
                                {workspaces.map((ws) => {
                                    const isActive = ws.id === selectedId;
                                    return (
                                        <HStack
                                            key={ws.id}
                                            px={2}
                                            py="7px"
                                            borderRadius="8px"
                                            cursor="pointer"
                                            _hover={{ bg: itemHoverBg }}
                                            transition="background 0.12s"
                                            onClick={() => handleSelect(ws.id)}
                                            justify="space-between"
                                        >
                                            <HStack spacing={2} minW={0}>
                                                <WorkspaceAvatar
                                                    name={ws.name}
                                                    size="sm"
                                                />
                                                <Text
                                                    fontSize="13px"
                                                    color={nameColor}
                                                    isTruncated
                                                    noOfLines={1}
                                                >
                                                    {ws.name}
                                                </Text>
                                            </HStack>
                                            {isActive && (
                                                <Box
                                                    color={activeCheckColor}
                                                    flexShrink={0}
                                                >
                                                    <Check size={14} />
                                                </Box>
                                            )}
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </Box>

                        <Divider borderColor={dividerColor} />

                        <Box px={2} py={2}>
                            <HStack
                                px={2}
                                py="7px"
                                borderRadius="8px"
                                cursor="pointer"
                                _hover={{ bg: itemHoverBg }}
                                transition="background 0.12s"
                                spacing={2}
                            >
                                <Box color={actionColor}>
                                    <Plus size={14} />
                                </Box>
                                <Text fontSize="13px" color={actionColor}>
                                    Create new workspace
                                </Text>
                            </HStack>

                            <HStack
                                px={2}
                                py="7px"
                                borderRadius="8px"
                                cursor="pointer"
                                _hover={{ bg: itemHoverBg }}
                                transition="background 0.12s"
                                spacing={2}
                            >
                                <Box color={actionColor}>
                                    <Globe size={14} />
                                </Box>
                                <Text fontSize="13px" color={actionColor}>
                                    Find workspaces
                                </Text>
                            </HStack>
                        </Box>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
};

export default WorkspaceDropdown;
