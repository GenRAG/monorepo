import { RerankerAnimation } from "components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerAnimation";
import { NodeOverviewLayout } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";

const STEPS = [
    {
        title: "Résultats entrants",
        description:
            "Nous recevons plusieurs documents ou passages récupérés à partir des étapes précédentes (par exemple, résultats de recherche, ingestion de documents, etc.)",
    },
    {
        title: "Évaluation de la pertinence",
        description:
            "Chaque résultat est évalué par rapport à la question de l'utilisateur à l'aide d'un modèle de classement IA",
    },
    {
        title: "Réorganisation intelligente",
        description: "Les résultats sont réorganisés pour placer le contenu le plus pertinent en haut",
    },
    {
        title: "Résultat optimisé",
        description: "Les composants en aval reçoivent des résultats de meilleure qualité, mieux classés",
    },
];

const RerankerOverviewTab = () => (
    <NodeOverviewLayout
        title="Comment améliorons-nous la pertinence des résultats ?"
        description="Nous analysons et réorganisons les résultats récupérés pour prioriser les informations les plus pertinentes"
        highlight={
            <>
                <strong>Plusieurs résultats en entrée.</strong> Nous affichons les <strong>meilleurs en sortie</strong>.
            </>
        }
        animation={RerankerAnimation}
        steps={STEPS}
    />
);

export default RerankerOverviewTab;
