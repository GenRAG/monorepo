import { RewriterAnimation } from "components/Agents/Workflow/NodeModalContent/Rewriter/RewriterNodeContent";
import { NodeInformationLayout } from "components/Agents/Workflow/NodeInformation/NodeInformationLayout";

export const RewriterInformation = () => (
    <NodeInformationLayout
        title="Pourquoi ajouter un Reformulateur à votre workflow ?"
        description="Améliorer la précision de la recherche en reformulant la question de l'utilisateur avant de la soumettre au retriever."
        highlight={
            <>
                Question vague en entrée. <strong>Requête optimisée</strong> en sortie.
            </>
        }
        animation={<RewriterAnimation />}
        metrics={[
            { label: "Pertinence des documents récupérés", value: 0.88 },
            { label: "Précision de la recherche", value: 0.82 },
            { label: "Qualité de la réponse finale", value: 0.78 },
            { label: "Robustesse aux questions vagues", value: 0.9 },
        ]}
        benefits={[
            {
                title: "Meilleure correspondance avec vos documents",
                description:
                    "La question reformulée utilise le vocabulaire exact de vos documents, augmentant la probabilité de retrouver les bons passages.",
            },
            {
                title: "Résistance aux questions ambiguës",
                description:
                    "Les questions courtes ou mal formulées sont enrichies du contexte nécessaire pour une recherche efficace.",
            },
            {
                title: "Réduction des faux positifs",
                description:
                    "Une requête plus précise réduit le nombre de documents non pertinents récupérés, améliorant ainsi la réponse générée.",
            },
            {
                title: "Complémentaire au bloc Classement",
                description:
                    "Combiné au bloc Classement, il agit en amont pour améliorer la qualité de la récupération et en aval pour affiner le classement.",
            },
        ]}
    />
);

export default RewriterInformation;
