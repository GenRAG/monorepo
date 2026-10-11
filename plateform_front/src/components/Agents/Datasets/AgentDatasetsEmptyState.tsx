import { Text, VStack } from "@chakra-ui/react";
import { CheckCircle2, Library, Plus, Unplug, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { GlassPanel } from "components/ui/GlassPanel";

export type AgentDatasetsEmptyKind = "no-dataset" | "none-attached" | "all-attached";

interface AgentDatasetsEmptyStateProps {
    kind: AgentDatasetsEmptyKind;
    workspaceId: string;
}

const CONTENT: Record<
    AgentDatasetsEmptyKind,
    { icon: LucideIcon; title: string; description: string; cta?: { label: string; icon: LucideIcon } }
> = {
    "no-dataset": {
        icon: Library,
        title: "Aucune base de connaissances",
        description:
            "Une base regroupe des documents que vos agents consultent pour répondre. Créez votre première base, puis revenez l'ajouter à cet agent.",
        cta: { label: "Créer une base", icon: Plus },
    },
    "none-attached": {
        icon: Unplug,
        title: "Aucune base utilisée",
        description: "Cet agent répond sans consulter de documents. Ajoutez une base ci-dessous pour l'alimenter.",
    },
    "all-attached": {
        icon: CheckCircle2,
        title: "Toutes vos bases sont utilisées",
        description: "Cet agent a accès à l'ensemble des bases de l'entreprise. Créez-en d'autres depuis la page Bases.",
        cta: { label: "Gérer les bases", icon: Library },
    },
};

export const AgentDatasetsEmptyState = ({ kind, workspaceId }: AgentDatasetsEmptyStateProps) => {
    const navigate = useNavigate();
    const { icon, title, description, cta } = CONTENT[kind];
    const isHero = kind === "no-dataset";

    return (
        <GlassPanel borderStyle="dashed" px={6} py={isHero ? 14 : 8}>
            <VStack spacing={3} maxW="420px" mx="auto" textAlign="center">
                <BoxIcon icon={icon} size={isHero ? "lg" : "md"} />
                <Text variant="body-md-semibold">{title}</Text>
                <Text variant="body-sm-muted">{description}</Text>
                {cta && (
                    <Button
                        size="sm"
                        variant={isHero ? "superPrimary" : "secondary"}
                        leftIcon={cta.icon}
                        onClick={() => void navigate(`/workspaces/${workspaceId}/datasets`)}
                    >
                        {cta.label}
                    </Button>
                )}
            </VStack>
        </GlassPanel>
    );
};
