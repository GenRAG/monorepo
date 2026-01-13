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
import { use, useState } from "react";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";

const Sidebar = () => {

  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("grey.50", "grey.900");
  const border = useColorModeValue("grey.200", "grey.700");
  const color = useColorModeValue("black", "whites.offwhite");
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  const [activeItem, setActiveItem] = useState("dashboard");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const { name, email } = useUserInfo();
  const { data: workspaces } = useGetUserWorkspacesQuery();

  return (
    <Box
      h="100vh"
      w={isOpen ? "240px" : "60px"}
      bg={bg}
      borderRight="1px solid"
      borderColor={border}
      display="flex"
      flexDirection="column"
      transition="width 0.3s ease"
      zIndex={10}
      justifyContent={"space-between"}
    >
      <Stack gap={8}>
        <SidebarHeader isOpen={isOpen} onToggle={onToggle} color={color} />

        <Stack>
          <SidebarSection title="Menu" isOpen={isOpen}>
            {mainMenu.map(({ id, icon, label }) => (
              <SidebarItem
                key={id}
                active={activeItem === id}
                onClick={() => setActiveItem(id)}
                icon={icon}
                label={label}
                open={isOpen}
                expandedItem={expandedItem}
                setExpandedItem={setExpandedItem}
                {...(id === "workspaces" && {
                  badge: `${workspaces?.length ?? 0} / 5`,
                  childrenItems: workspaces?.map(w => ({
                    label: w.name,
                    onClick: () => setActiveItem(`workspace-${w.id}`),
                  })),
                })}
              />
            ))}
          </SidebarSection>
          <Divider w="100%" borderColor={border} borderWidth="1px" />

          <SidebarSection title="Features" isOpen={isOpen}>
            {featureMenu.map(({ id, icon, label }) => (
              <SidebarItem
                key={id}
                active={activeItem === id}
                onClick={() => setActiveItem(id)}
                icon={icon}
                label={label}
                open={isOpen}
                expandedItem={expandedItem}
                setExpandedItem={setExpandedItem}
              />
            ))}
          </SidebarSection>
          <Divider w="100%" borderColor={border} borderWidth="1px" />
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
