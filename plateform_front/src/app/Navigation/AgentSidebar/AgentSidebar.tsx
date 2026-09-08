import {
    Box,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerOverlay,
    HStack,
    IconButton,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { Menu, PanelRightClose, PanelRightOpen } from "lucide-react";
import { agentNavItems, agentNavSections } from "app/Navigation/sidebarConfig";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useNavigate, useParams } from "react-router-dom";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";
import { useGetAgentByIdQuery } from "services/agent/agent";
import Button from "components/ui/Button";

const AgentSidebar = () => {
    const navigate = useNavigate();

    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { data: agent } = useGetAgentByIdQuery({ workspaceId, id: agentId }, { skip: !workspaceId || !agentId });

    const isMobile = useAppResponsive({ base: true, lg: false });

    const activePath = useActiveSidebarItem(agentNavItems.map((i) => i.id));

    const bg = useColorModeValue("white", "grey.900");
    const bgMobile = useColorModeValue("white", "linear-gradient(135deg,rgb(46, 52, 60) 0%,rgb(69, 76, 86) 100%)");
    const border = useColorModeValue("grey.100", "grey.700");
    const color = useColorModeValue("grey.900", "white");
    const labelColor = useColorModeValue("grey.500", "grey.400");

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
    const ToggleIcon = isOpen ? PanelRightClose : PanelRightOpen;

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
                            flex={1}
                            minW={0}
                        >
                            {agentName}
                        </Text>
                    )}
                    <Button
                        size="md"
                        btnType="icon"
                        onClick={() => {
                            onToggle();
                        }}
                        icon={ToggleIcon}
                        flexShrink={0}
                    />
                </HStack>
                <Box h="1px" bg="borderSubtle" />

                <VStack align="stretch" spacing={2} mt={4}>
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
                            {section.items.map(({ id, icon, label }) => {
                                if (id === "retour") {
                                    return (
                                        <SidebarItem
                                            key={id}
                                            active={activePath === id}
                                            onClick={() => void handleBackToDashboard()}
                                            icon={icon}
                                            label={label}
                                            open={isOpen}
                                            size="md"
                                        />
                                    );
                                }

                                return (
                                    <SidebarItem
                                        key={id}
                                        active={activePath === id}
                                        onClick={() => void handleItemClick(id)}
                                        icon={icon}
                                        label={label}
                                        open={isOpen}
                                        size="md"
                                    />
                                );
                            })}
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
            borderColor="borderSubtle"
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
