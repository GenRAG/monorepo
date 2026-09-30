import { ResponseAnimation } from "components/Agents/Workflow/NodeModalContent/Response/ResponseAnimation";
import { NodeOverviewLayout } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";

const STEPS = [
    {
        title: "Agrégation du contexte",
        description: "Les documents pertinents et les signaux du workflow sont collectés et préparés.",
    },
    {
        title: "Génération de la réponse",
        description: "Le modèle de langage génère une réponse ancrée dans le contexte récupéré.",
    },
    {
        title: "Affinage de la réponse",
        description: "La réponse est affinée pour garantir clarté, pertinence et cohérence.",
    },
    {
        title: "Résultat final",
        description: "La réponse finale est livrée avec les sources utilisées pour la générer.",
    },
];

const ResponseOverviewTab = () => (
    <NodeOverviewLayout
        title="Comment est générée la réponse finale ?"
        description="Nous générons une réponse claire et fiable en combinant votre requête avec les documents les plus pertinents."
        highlight={
            <>
                La réponse est <strong>contextuelle</strong>, <strong>classée</strong> et prête à l&apos;emploi.
            </>
        }
        animation={ResponseAnimation}
        steps={STEPS}
    />
);

export default ResponseOverviewTab;
