import type { SectionData } from "./types";

export const TERMS_SECTIONS: SectionData[] = [
    {
        number: 1,
        id: "access",
        title: "Accès au service",
        intro: "GenRAG est une plateforme SaaS d'infrastructure RAG accessible sur abonnement. L'accès est réservé aux professionnels et entreprises disposant d'un compte valide.",
        bullets: [
            "Vous devez être âgé de 18 ans ou plus pour utiliser le service",
            "Les informations fournies lors de l'inscription doivent être exactes et maintenues à jour",
            "Chaque compte est nominatif et ne peut être partagé sans licence multi-utilisateurs",
            "GenRAG se réserve le droit de suspendre tout compte en cas d'utilisation contraire aux présentes conditions",
        ],
    },
    {
        number: 2,
        id: "usage",
        title: "Usage acceptable",
        intro: "Il est strictement interdit d'utiliser GenRAG pour :",
        bullets: [
            "Générer, distribuer ou stocker des contenus illégaux ou portant atteinte aux droits de tiers",
            "Tenter un accès non autorisé aux systèmes, bases de données ou comptes d'autres utilisateurs",
            "Saturer délibérément l'infrastructure (attaques DDoS, abus d'API)",
            "Utiliser les modèles d'IA intégrés en violation des conditions des fournisseurs concernés",
            "Traiter des données personnelles sensibles sans les garanties contractuelles appropriées",
        ],
    },
    {
        number: 3,
        id: "ip",
        title: "Propriété intellectuelle",
        intro: "GenRAG et ses composants sont protégés par le droit de la propriété intellectuelle :",
        bullets: [
            "La plateforme, son interface et sa technologie sont la propriété exclusive de GenRAG SAS",
            "Vos données, documents et configurations d'agents vous appartiennent entièrement",
            "Vous accordez à GenRAG une licence limitée pour traiter vos données dans le seul but de fournir le service",
            "Toute reproduction ou distribution non autorisée de la plateforme est interdite",
        ],
    },
    {
        number: 4,
        id: "liability",
        title: "Responsabilité",
        intro: "Dans les limites permises par la loi applicable :",
        bullets: [
            "GenRAG fournit le service « en l'état » sans garantie de résultat sur la qualité des réponses IA",
            "GenRAG ne saurait être tenu responsable des interruptions de service liées à des causes extérieures",
            "La responsabilité de GenRAG est limitée au montant des sommes versées au cours des 12 derniers mois",
            "L'utilisateur est responsable de l'exactitude des documents téléversés et de leur conformité légale",
        ],
    },
    {
        number: 5,
        id: "changes",
        title: "Modifications",
        text: "GenRAG se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés par e-mail de toute modification substantielle au moins 30 jours avant son entrée en vigueur. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.",
    },
];
