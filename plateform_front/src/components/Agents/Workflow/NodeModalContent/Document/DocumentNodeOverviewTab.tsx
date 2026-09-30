import { DocumentDatabaseAnimation } from "components/Agents/Workflow/NodeModalContent/Document/DocumentAnimation";
import { NodeOverviewLayout } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";

const STEPS = [
    {
        title: "Ingestion de documents",
        description: "Vous pouvez télécharger et traiter divers formats de documents (PDF, TXT, DOCX)",
    },
    {
        title: "Vectorisation",
        description: "Nous découpons le texte et le convertissons en vecteurs numériques à l'aide d'embeddings IA",
    },
    {
        title: "Stockage vectoriel",
        description: "Nous stockons les vecteurs dans une base de données optimisée pour une récupération rapide",
    },
    {
        title: "Recherche sémantique",
        description: "Nous trouvons des documents similaires en fonction du sens, pas seulement des mots-clés",
    },
];

const DocumentOverviewTab = () => (
    <NodeOverviewLayout
        title="Comment gérons-nous vos documents ?"
        description="Nous transformons et stockons les documents en vecteurs consultables pour une récupération basée sur l'IA"
        highlight={
            <>
                <strong>Téléchargez</strong> vos documents. Nous gérons <strong>le reste</strong>.
            </>
        }
        animation={DocumentDatabaseAnimation}
        steps={STEPS}
    />
);

export default DocumentOverviewTab;
