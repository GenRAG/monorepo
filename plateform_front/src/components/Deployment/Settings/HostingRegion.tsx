import { useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { RegionCard } from "components/Deployment/RegionCard";
import SectionHeader from "components/Deployment/SectionHeader";

export const HostingRegion = () => {
    const [region, setRegion] = useState("eu");

    return (
        <Box borderRadius="12px" border="1px solid" borderColor="borderDefault" bg="surfacePrimary">
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
