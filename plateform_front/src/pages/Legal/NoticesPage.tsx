import { Scale } from "lucide-react";
import { LegalDocPage } from "components/Legal/LegalDocPage";
import { NOTICES_SECTIONS } from "./data/notices";

export const NoticesPage = () => (
    <LegalDocPage
        badge={{ icon: Scale, label: "Légal" }}
        title="Mentions légales"
        description="Informations légales obligatoires relatives à l'éditeur de la plateforme GenRAG et à son hébergement, conformément à la loi française n°2004-575 pour la confiance dans l'économie numérique."
        date="4 juin 2026"
        readTime="~2 min de lecture"
        sections={NOTICES_SECTIONS}
    />
);
