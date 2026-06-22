import { useState } from "react";
import { Box, useColorModeValue, VStack } from "@chakra-ui/react";
import { Eye, Globe, Lock, Zap } from "lucide-react";
import RadioButton from "components/ui/RadioButton";
import { VisibilityMode, VisibilityStatus } from "types/agent/agent";
import SectionHeader from "components/Deployment/SectionHeader";

const VISIBILITY_OPTIONS: {
    id: VisibilityMode;
    icon: React.ReactNode;
    title: string;
    description: string;
}[] = [
    {
        id: VisibilityStatus.PUBLIC,
        icon: <Globe size={16} />,
        title: "Public",
        description: "Toute personne avec le lien peut discuter avec l'agent.",
    },
    {
        id: VisibilityStatus.PRIVATE,
        icon: <Lock size={16} />,
        title: "Privé",
        description: "Seuls les emails autorises peuvent acceder.",
    },
    {
        id: VisibilityStatus.API,
        icon: <Zap size={16} />,
        title: "API uniquement",
        description: "Pas d'interface chat - acces via cle API uniquement.",
    },
];

export const VisibilitySection = () => {
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const [visibility, setVisibility] = useState<VisibilityMode>(VisibilityStatus.PRIVATE);

    return (
        <Box borderRadius="12px" border="1px solid" borderColor={borderColor} bg={bgColor}>
            <SectionHeader title="Visibilité" icon={Eye} />
            <VStack spacing={0} align="stretch">
                {VISIBILITY_OPTIONS.map((opt, idx) => {
                    const isSelected = visibility === opt.id;

                    return (
                        <RadioButton
                            key={opt.id}
                            icon={opt.icon}
                            title={opt.title}
                            subtitle={opt.description}
                            isSelected={isSelected}
                            onClick={() => setVisibility(opt.id)}
                            borderRadius={idx === 2 ? "0px 0px 10px 10px" : "0"}
                        />
                    );
                })}
            </VStack>
        </Box>
    );
};

export default VisibilitySection;
