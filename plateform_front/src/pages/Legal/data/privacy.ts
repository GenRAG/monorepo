import type { SectionData } from "./types";

export const PRIVACY_SECTIONS: SectionData[] = [
    {
        number: 1,
        id: "data-collection",
        title: "Données collectées",
        intro: "Nous collectons uniquement les données strictement nécessaires au bon fonctionnement du service GenRAG. Ces données sont de deux natures :",
        subparts: [
            {
                title: "Données fournies directement",
                items: [
                    "Identité : nom, prénom, adresse e-mail, organisation",
                    "Identifiants de connexion (mot de passe chiffré, tokens d'accès)",
                    "Documents et fichiers téléversés dans vos espaces de travail",
                    "Configurations d'agents, de pipelines RAG et de bases de connaissances",
                ],
            },
            {
                title: "Données collectées automatiquement",
                items: [
                    "Journaux d'accès : adresse IP, navigateur, système d'exploitation",
                    "Données d'utilisation : requêtes, volumes traités, métriques de performance",
                    "Données de facturation et d'abonnement",
                ],
            },
        ],
        infoBox:
            "GenRAG ne vend jamais vos données personnelles à des tiers. Vos documents et données de travail restent strictement confidentiels et ne sont pas utilisés pour entraîner des modèles d'intelligence artificielle.",
    },
    {
        number: 2,
        id: "data-use",
        title: "Utilisation des données",
        intro: "Vos données sont utilisées exclusivement pour les finalités suivantes :",
        bullets: [
            "Fourniture et amélioration du service GenRAG",
            "Gestion de votre compte et de votre abonnement",
            "Support technique et communication liée au service",
            "Respect des obligations légales et réglementaires",
            "Détection et prévention des usages frauduleux",
        ],
    },
    {
        number: 3,
        id: "cookies",
        title: "Cookies",
        intro: "GenRAG utilise uniquement des cookies strictement nécessaires au fonctionnement du service :",
        bullets: [
            "Cookies de session pour maintenir votre connexion sécurisée (JWT, HttpOnly)",
            "Cookies de préférences pour mémoriser vos paramètres d'interface",
            "Aucun cookie publicitaire ou de tracking tiers",
        ],
    },
    {
        number: 4,
        id: "rights",
        title: "Vos droits (RGPD)",
        intro: "Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :",
        bullets: [
            "Droit d'accès : obtenir une copie de vos données",
            "Droit de rectification : corriger des données inexactes",
            "Droit à l'effacement : demander la suppression de vos données",
            "Droit à la portabilité : recevoir vos données dans un format structuré",
            "Droit d'opposition : vous opposer à certains traitements",
        ],
        infoBox:
            "Pour exercer vos droits, contactez notre DPO à dpo@genrag.io. Nous répondrons dans un délai de 30 jours conformément à la réglementation.",
    },
    {
        number: 5,
        id: "dpo",
        title: "Contact DPO",
        text: "Notre Délégué à la Protection des Données (DPO) est votre interlocuteur privilégié pour toute question relative à vos données personnelles. Vous pouvez le contacter à l'adresse dpo@genrag.io ou par courrier à notre siège social.",
    },
];
