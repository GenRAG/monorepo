import {
    Box,
    Collapse,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerOverlay,
    HStack,
    Icon,
    IconButton,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";
import { useAppSelector } from "store";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { LEGAL_NAV } from "pages/Legal/data/legalNav";
import { useActiveSection } from "hooks/useActiveSection";
import { useAppResponsive } from "hooks/useAppResponsive";

const SubList = ({
    subsections,
    activeHash,
    onSelect,
}: {
    subsections: { label: string; hash: string }[];
    activeHash: string;
    onSelect: (hash: string) => void;
}) => {
    const subColor = useColorModeValue("grey.500", "grey.400");
    const borderColor = useColorModeValue("grey.100", "grey.600");

    return (
        <HStack align="stretch" pl={4} spacing={0} mt={1} mb={2}>
            <Box w="1.5px" bg={borderColor} borderRadius="0px" alignSelf="stretch" mr={2} />
            <VStack align="stretch" w="100%" spacing={0}>
                {subsections.map((sub) => {
                    const isActive = activeHash === sub.hash;
                    return (
                        <Box
                            key={sub.hash}
                            as="a"
                            href={`#${sub.hash}`}
                            display="block"
                            px={2}
                            py={1.5}
                            borderRadius="4px"
                            style={{ textDecoration: "none" }}
                            onClick={() => onSelect(sub.hash)}
                        >
                            <Text
                                fontSize="xs"
                                color={isActive ? currentDarkTheme.primary500 : subColor}
                                fontWeight={isActive ? "semibold" : "normal"}
                                transition="color 0.1s"
                                noOfLines={1}
                            >
                                {sub.label}
                            </Text>
                        </Box>
                    );
                })}
            </VStack>
        </HStack>
    );
};

export const LegalSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: workspaces } = useGetUserWorkspacesQuery();
    const lastWorkspaceId = useAppSelector((state) => state.navigation.lastWorkspaceId);
    const bg = useColorModeValue("white", "linear-gradient(135deg,rgba(44, 44, 44, 0.54) 0%,rgb(69, 69, 69) 100%)");
    const bgMobile = useColorModeValue("white", "linear-gradient(135deg,rgb(5, 5, 5) 0%, #363636ff 100%)");
    const border = useColorModeValue("grey.100", "grey.500");
    const itemColor = useColorModeValue("grey.900", "white");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const backColor = useColorModeValue("grey.500", "grey.400");
    const backHoverBg = useColorModeValue("grey.50", "grey.800");
    const iconColor = useColorModeValue("grey.300", "white");

    const isMobile = useAppResponsive({ base: true, lg: false });
    const { isOpen, onToggle, onClose } = useDisclosure({ defaultIsOpen: false });

    const activeNav = LEGAL_NAV.find((item) => location.pathname === item.href);
    const subsectionIds = useMemo(() => activeNav?.subsections.map((s) => s.hash) ?? [], [activeNav]);
    const [activeHash, setActiveHash] = useActiveSection(subsectionIds);

    useEffect(() => {
        if (isMobile) onClose();
    }, [location.pathname, isMobile, onClose]);

    const sidebarContent = (
        <Box flex={1} overflowY="auto">
            <HStack px={3} py={3} minH="48px">
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    letterSpacing="0.8px"
                    color={labelColor}
                    textTransform="uppercase"
                >
                    Légal
                </Text>
            </HStack>
            <HStack
                px={5}
                py="13.5px"
                spacing={2}
                cursor="pointer"
                borderBottom="1px solid"
                borderColor={border}
                color={backColor}
                _hover={{ bg: backHoverBg }}
                onClick={() => {
                    const id = lastWorkspaceId ?? workspaces?.[0]?.id;
                    void navigate(id ? `/workspaces/${id}/dashboard` : "/workspaces");
                }}
            >
                <Icon as={ArrowLeft} boxSize={3.5} />
                <Text fontSize="sm" fontWeight="medium">
                    Retour
                </Text>
            </HStack>
            <VStack align="stretch" spacing={0}>
                {LEGAL_NAV.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Box key={item.id}>
                            <NavLink to={item.href} style={{ textDecoration: "none" }}>
                                <HStack
                                    px={4}
                                    py={3}
                                    position="relative"
                                    spacing={3}
                                    overflow="hidden"
                                    bg={isActive ? currentDarkTheme.rgba.primary20 : "transparent"}
                                    color={isActive ? currentDarkTheme.primary500 : itemColor}
                                    _hover={{ bg: currentDarkTheme.rgba.primary20, cursor: "pointer" }}
                                    _before={{
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: "4px",
                                        bg: isActive ? currentDarkTheme.primary : "transparent",
                                        borderTopRightRadius: "9999px",
                                        borderBottomRightRadius: "9999px",
                                    }}
                                >
                                    <Icon as={item.icon} boxSize={4} />
                                    <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"} noOfLines={2}>
                                        {item.label}
                                    </Text>
                                </HStack>
                            </NavLink>
                            <Collapse in={isActive} animateOpacity>
                                <SubList
                                    subsections={item.subsections}
                                    activeHash={activeHash}
                                    onSelect={setActiveHash}
                                />
                            </Collapse>
                        </Box>
                    );
                })}
            </VStack>
        </Box>
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
                    justifyContent="center"
                    pt={4}
                    flexShrink={0}
                >
                    <IconButton
                        aria-label="Ouvrir le menu légal"
                        icon={<Menu size={20} />}
                        variant="ghost"
                        color={iconColor}
                        onClick={onToggle}
                    />
                </Box>
                <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
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
            w="220px"
            flexShrink={0}
            h="100vh"
            bg={bg}
            borderRight="1px solid"
            borderColor={border}
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            {sidebarContent}
        </Box>
    );
};
