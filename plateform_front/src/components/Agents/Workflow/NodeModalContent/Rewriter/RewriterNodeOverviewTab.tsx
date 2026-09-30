import { RewriterAnimation } from "components/Agents/Workflow/NodeModalContent/Rewriter/RewriterAnimation";
import { NodeOverviewLayout } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";

const STEPS = [
    {
        title: "Analyse de la question",
        description: "Le modèle LLM analyse l'intention derrière la question de l'utilisateur.",
    },
    {
        title: "Reformulation",
        description: "La question est réécrite avec les termes les plus susceptibles de matcher vos documents.",
    },
    {
        title: "Meilleure récupération",
        description: "La requête reformulée améliore la pertinence des documents récupérés par le retriever.",
    },
];

const RewriterOverviewTab = () => (
    <NodeOverviewLayout
        title="Comment la question est-elle améliorée ?"
        description="Le Reformulateur reformule la question de l'utilisateur pour mieux correspondre aux documents indexés."
        highlight={
            <>
                <strong>Une question vague en entrée.</strong> Une question <strong>précise et contextualisée</strong>{" "}
                en sortie.
            </>
        }
        animation={RewriterAnimation}
        steps={STEPS}
    />
);

export default RewriterOverviewTab;
