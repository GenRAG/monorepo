import { QueryAnimation } from "components/Agents/Workflow/NodeModalContent/Query/QueryAnimation";
import { NodeOverviewLayout } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";

const STEPS = [
    {
        title: "Entrée utilisateur",
        description: "L'utilisateur écrit une question ou une instruction en langage naturel.",
    },
    {
        title: "Injection de contexte",
        description: "Les instructions système et les métadonnées sont attachées pour guider la récupération.",
    },
    {
        title: "Déclenchement du pipeline",
        description: "La requête est envoyée en aval pour la récupération, le classement et la génération.",
    },
];

const QueryOverviewTab = () => (
    <NodeOverviewLayout
        title="Comment une requête utilisateur entre-t-elle dans le système ?"
        description="La requête est le point de départ de l'ensemble du flux de travail GenRAG."
        highlight={
            <>
                <strong>Posez une question.</strong> Nous la propageons à travers le pipeline.
            </>
        }
        animation={QueryAnimation}
        steps={STEPS}
    />
);

export default QueryOverviewTab;
