import {
  Box,
  useColorModeValue,
  useDisclosure,
  useColorMode,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { featureMenu, mainMenu, supportMenu } from "app/Navigation/sidebarConfig";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import { SidebarHeader } from "app/Navigation/SidebarHeader";
import { SidebarItem } from "app/Navigation/SidebarItem";
import { SidebarSection } from "app/Navigation/SidebarSection";
import { useUserInfo } from "hooks/useUserInfo";
import { use, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

const Sidebar = () => {

  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const bg = useColorModeValue(
    "black",
    "linear-gradient(135deg, #0505058a 0%, #363636ff 100%)"
  );
  const border = useColorModeValue(
    "green.100",
    currentDarkTheme.rgba.primary20
  );
  const color = useColorModeValue("grey.900", "white");
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  const getActiveItemFromPath = (pathname: string) => {
    const path = pathname;

    if (path === "/dashboard" || path.startsWith("/dashboard")) {
      return "dashboard";
    }
    if (path === "/" || path === "") {
      return "dashboard";
    }

    const featureRoutes: Record<string, string> = {
      "/analytics": "analytics",
      "/reports": "reports",
      "/extensions": "extensions",
      "/companies": "companies",
      "/people": "people",
    };

    for (const [route, id] of Object.entries(featureRoutes)) {
      if (path === route || path.startsWith(route + "/")) {
        return id;
      }
    }

    if (path.includes("/workspace")) {
      return "workspaces";
    }

    return "dashboard";
  };

  const [activeItem, setActiveItem] = useState<string>(() => getActiveItemFromPath(location.pathname));
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const newActiveItem = getActiveItemFromPath(location.pathname);
    if (newActiveItem) {
      setActiveItem(newActiveItem);
    }
  }, [location.pathname]);

  const { name, email } = useUserInfo();
  const { data: workspaces } = useGetUserWorkspacesQuery();

  return (
    <Box
      h="100vh"
      w={isOpen ? "220px" : "60px"}
      bg={bg}
      borderRight="1px solid"
      borderColor={border}
      display="flex"
      flexDirection="column"
      transition="width 0.3s ease"
      zIndex={10}
      justifyContent={"space-between"}
      position="relative"
      overflow="hidden"
    >
      <Stack gap={8}>
        <SidebarHeader title="GenRAG" isOpen={isOpen} onToggle={onToggle} color={color} />

        <Stack gap={0}>
          <SidebarSection title="Menu" isOpen={isOpen}>
            {mainMenu.map(({ id, icon, label }) => (
              <SidebarItem
                key={id}
                active={activeItem === id}
                onClick={() => {
                  setActiveItem(id);
                  if (id === "dashboard") {
                    navigate("/dashboard");
                  } else if (id === "workspaces" && workspaces && workspaces.length > 0) {
                    // Navigate to first workspace chat by default
                    navigate(`/workspace/${workspaces[0].id}/chat`);
                  }
                }}
                icon={icon}
                label={label}
                open={isOpen}
                expandedItem={expandedItem}
                setExpandedItem={setExpandedItem}
                {...(id === "workspaces" && {
                  badge: `${workspaces?.length ?? 0} / 5`,
                  childrenItems: workspaces?.map(w => ({
                    label: w.name,
                    onClick: () => {
                      setActiveItem(`workspace-${w.id}`);
                      navigate(`/workspace/${w.id}/chat`);
                    },
                  })),
                })}
              />
            ))}
          </SidebarSection>
          <Divider m={0} w="100%" borderColor={border} borderWidth="1px" />

          <SidebarSection title="Features" isOpen={isOpen}>
            {featureMenu.map(({ id, icon, label }) => (
              <SidebarItem
                key={id}
                active={activeItem === id}
                onClick={() => {
                  setActiveItem(id);
                  navigate(`/${id}`);
                }}
                icon={icon}
                label={label}
                open={isOpen}
                expandedItem={expandedItem}
                setExpandedItem={setExpandedItem}
              />
            ))}
          </SidebarSection>
        </Stack>
      </Stack>

      <SidebarFooter
        isOpen={isOpen}
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        name={name}
        email={email}
        supportMenu={supportMenu}
        expandedItem={expandedItem}
        setExpandedItem={setExpandedItem}
      />
    </Box>
  );
};

export default Sidebar;
