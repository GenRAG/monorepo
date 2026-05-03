import { useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { useIsDark } from "hooks/useIsDark";
import { RegionCard } from "components/Deployment/RegionCard";
import SectionHeader from "components/Deployment/SectionHeader";

export const HostingRegion = () => {
    const isDark = useIsDark();
    const [region, setRegion] = useState("eu");

    return (
        <Box
            borderRadius="12px"
            border="1px solid"
            borderColor={isDark ? "grey.800" : "grey.100"}
            bg={isDark ? "grey.950" : "white"}
        >
            <SectionHeader
                title="Région d'hébergement"
                subtitle="Sélectionnez la région où vous souhaitez héberger votre application"
            />
            <HStack spacing={3} align="stretch" p={5}>
                <RegionCard
                    flag="🇪🇺"
                    name="Europe"
                    description="OVH Paris · RGPD"
                    badge="ACTIF"
                    isSelected={region === "eu"}
                    onClick={() => setRegion("eu")}
                />
                <RegionCard
                    flag="🇺🇸"
                    name="États-Unis"
                    description="AWS Virginie"
                    isSelected={region === "us"}
                    onClick={() => setRegion("us")}
                />
                <RegionCard
                    flag="🌐"
                    name="Edge global"
                    description="Réplication auto"
                    isSelected={region === "edge"}
                    onClick={() => setRegion("edge")}
                />
            </HStack>
        </Box>
    );
};

export default HostingRegion;
