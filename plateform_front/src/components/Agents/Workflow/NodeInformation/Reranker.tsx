import { RerankerAnimation } from "components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerAnimation";
import { NodeInformationLayout } from "components/Agents/Workflow/NodeInformation/NodeInformationLayout";

export const RerankerInformation = () => (
    <NodeInformationLayout
        title="Pourquoi ajouter un Classeur à votre workflow ?"
        description="Améliorer la qualité des réponses en priorisant les résultats les plus pertinents avant la génération"
        highlight={
            <>
                Mêmes données. <strong>Meilleures réponses.</strong>
            </>
        }
        animation={<RerankerAnimation />}
        metrics={[
            { label: "Pertinence de la réponse", value: 0.9 },
            { label: "Réduction du bruit", value: 0.8 },
            { label: "Efficacité des tokens", value: 0.75 },
            { label: "Satisfaction utilisateur", value: 0.85 },
        ]}
        benefits={[
            {
                title: "Meilleure qualité de réponse",
                description:
                    "Le modèle de langage reçoit d'abord le contexte le plus pertinent, ce qui entraîne des réponses plus claires et plus précises",
            },
            {
                title: "Hallucinations réduites",
                description:
                    "Supprimer le contexte non pertinent aide à prévenir les réponses incorrectes ou trompeuses",
            },
            {
                title: "Meilleure utilisation de vos tokens",
                description:
                    "Des entrées plus propres entraînent souvent des générations plus courtes et plus efficaces en termes de coûts",
            },
            {
                title: "Essentiel pour les grandes bases de connaissances",
                description: "Particulièrement efficace lorsque de nombreux documents ou fragments sont récupérés",
            },
        ]}
    />
);

export default RerankerInformation;
