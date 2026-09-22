import { FileText } from "lucide-react";
import { LegalDocPage } from "components/Legal/LegalDocPage";
import { TERMS_SECTIONS } from "./data/terms";

export const TermsPage = () => (
    <LegalDocPage
        badge={{ icon: FileText, label: "Utilisation" }}
        title="Conditions d'utilisation"
        description="En accédant à la plateforme GenRAG, vous acceptez les présentes conditions. Lisez-les attentivement avant toute utilisation du service."
        date="4 juin 2026"
        readTime="~6 min de lecture"
        sections={TERMS_SECTIONS}
    />
);
