import { Box, useColorModeValue, VStack } from "@chakra-ui/react";
import { Code2, Link2, Terminal } from "lucide-react";
import { DistribRow } from "components/Deployment/DistribRow";
import SectionHeader from "components/Deployment/SectionHeader";

export const DistributionSection = () => {
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    return (
        <Box borderRadius="12px" border="1px solid" borderColor={borderColor} bg={bgColor}>
            <SectionHeader
                title="Distribution"
                subtitle="Partagez votre assistant avec vos utilisateurs finaux via différents canaux de distribution."
            />
            <VStack align="stretch">
                <DistribRow
                    icon={Link2}
                    label="Lien public"
                    value="genrag.app/c/assistant-juridique"
                    actionLabel="Copier"
                />
                <DistribRow
                    icon={Code2}
                    label="Widget iframe"
                    value={'<iframe src="genrag.app/embed/aj" />'}
                    actionLabel="Copier"
                />
                <DistribRow
                    icon={Terminal}
                    label="API REST"
                    value="POST api.genrag.io/v1/agents/aj/chat"
                    actionLabel="Doc"
                />
            </VStack>
        </Box>
    );
};

export default DistributionSection;
