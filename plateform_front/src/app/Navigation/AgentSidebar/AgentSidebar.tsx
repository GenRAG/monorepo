import {
    Box,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerOverlay,
    HStack,
    Icon,
    IconButton,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { ArrowLeft, Menu, PanelRightClose, PanelRightOpen } from "lucide-react";
import { agentNavItems, agentNavSections } from "app/Navigation/sidebarConfig";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useNavigate, useParams } from "react-router-dom";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";
import { useGetAgentByIdQuery } from "services/agent/agent";

const AgentSidebar = () => {
    const navigate = useNavigate();

    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { data: agent } = useGetAgentByIdQuery({ workspaceId, id: agentId }, { skip: !workspaceId || !agentId });

    const isMobile = useAppResponsive({ base: true, lg: false });

    const activePath = useActiveSidebarItem(agentNavItems.map((i) => i.id));

    const bg = useColorModeValue("white", "linear-gradient(135deg,rgba(44, 44, 44, 0.54) 0%,rgb(69, 69, 69) 100%)");
    const bgMobile = useColorModeValue("white", "linear-gradient(135deg,rgb(44, 44, 44) 0%,rgb(69, 69, 69) 100%)");
    const border = useColorModeValue("grey.100", "grey.700");
    const color = useColorModeValue("grey.900", "white");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const backItemColor = useColorModeValue("grey.500", "grey.400");
    const backItemHoverBg = useColorModeValue("grey.50", "grey.800");
    const hoverToggleBg = useColorModeValue("grey.100", "grey.700");

    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !isMobile });

    const handleItemClick = async (id: string) => {
        if (workspaceId && agentId) {
            await navigate(`/workspaces/${workspaceId}/agents/${agentId}/${id}`);
            if (isMobile) onToggle();
        }
    };

    const handleBackToDashboard = async () => {
        await navigate(`/workspaces/${workspaceId}/dashboard`);
        if (isMobile) onToggle();
    };

    const agentName = agent?.name?.toUpperCase() ?? "";

    const sidebarContent = (
        <Stack gap={0} flex={1} overflow="hidden" justify="space-between">
            <Stack gap={0}>
                <HStack
                    justify={isOpen ? "space-between" : "center"}
                    align="center"
                    px={isOpen ? 3 : 0}
                    py={3}
                    minH="48px"
                >
                    {isOpen && (
                        <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            letterSpacing="0.8px"
                            color={labelColor}
                            noOfLines={1}
                        >
                            AGENT{agentName ? ` - ${agentName}` : ""}
                        </Text>
                    )}
                    <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={isMobile ? onToggle : onToggle}
                        aria-label="Toggle sidebar"
                        color={color}
                        _hover={{ bg: hoverToggleBg }}
                        icon={<Icon boxSize={4} as={isOpen ? PanelRightOpen : PanelRightClose} />}
                    />
                </HStack>

                <VStack align="stretch" spacing={0} mt={1}>
                    <HStack
                        px={5}
                        py="13.5px"
                        spacing={2}
                        cursor="pointer"
                        _hover={{ bg: backItemHoverBg }}
                        onClick={() => void handleBackToDashboard()}
                        borderBottom="1px solid"
                        borderColor={border}
                        mb={4}
                    >
                        <Icon as={ArrowLeft} boxSize={3.5} color={backItemColor} />
                        {isOpen && (
                            <Text fontSize="sm" color={backItemColor} fontWeight="medium">
                                Dashboard
                            </Text>
                        )}
                    </HStack>

                    {agentNavSections.map((section, i) => (
                        <Box key={section.label}>
                            {i > 0 && <Box h={3} />}
                            {isOpen && (
                                <Text
                                    fontSize="9px"
                                    fontWeight="700"
                                    letterSpacing="0.1em"
                                    textTransform="uppercase"
                                    color={labelColor}
                                    px={5}
                                    pt={i > 0 ? 2 : 1}
                                    pb={1}
                                >
                                    {section.label}
                                </Text>
                            )}
                            {section.items.map(({ id, icon, label }) => (
                                <SidebarItem
                                    key={id}
                                    active={activePath === id}
                                    onClick={() => void handleItemClick(id)}
                                    icon={icon}
                                    label={label}
                                    open={isOpen}
                                    size="md"
                                />
                            ))}
                        </Box>
                    ))}
                </VStack>
            </Stack>

            <SidebarFooter isOpen={isOpen} activeItem={activePath ?? ""} supportMenu={[]} />
        </Stack>
    );

    if (isMobile) {
        return (
            <>
                <Box
                    w="48px"
                    minW="48px"
                    h="100vh"
                    bg={bgMobile}
                    borderRight="1px solid"
                    borderColor={border}
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="center"
                    pt={4}
                    flexShrink={0}
                >
                    <IconButton
                        aria-label="Ouvrir le menu agent"
                        icon={<Menu size={20} />}
                        variant="ghost"
                        color={color}
                        onClick={onToggle}
                    />
                </Box>
                <Drawer isOpen={isOpen} placement="left" onClose={onToggle} size="xs">
                    <DrawerOverlay />
                    <DrawerContent bg={bgMobile} maxW="220px" borderRadius={0}>
                        <DrawerBody p={0} display="flex" flexDirection="column">
                            {sidebarContent}
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        );
    }

    return (
        <Box
            h="100vh"
            w={isOpen ? "200px" : "60px"}
            bg={bg}
            borderRight="1px solid"
            borderColor={border}
            display="flex"
            flexDirection="column"
            transition="width 0.3s ease"
            zIndex={10}
            flexShrink={0}
            overflow="hidden"
        >
            {sidebarContent}
        </Box>
    );
};

export default AgentSidebar;
