import { Shield } from "lucide-react";
import { LegalDocPage } from "components/Legal/LegalDocPage";
import { PRIVACY_SECTIONS } from "./data/privacy";

export const PrivacyPage = () => (
    <LegalDocPage
        badge={{ icon: Shield, label: "Confidentialité" }}
        title="Politique de confidentialité"
        description="Cette politique décrit comment GenRAG collecte, utilise et protège vos données personnelles conformément au RGPD et à la loi Informatique et Libertés."
        date="4 juin 2026"
        readTime="~5 min de lecture"
        scope="Applicable UE / monde entier"
        sections={PRIVACY_SECTIONS}
    />
);
