const colorTokens = {
    // === INPUTS ===
    inputText: { default: "grey.900", _dark: "grey.100" },
    inputBorder: { default: "grey.100", _dark: "grey.700" },
    inputPlaceholder: { default: "grey.500", _dark: "grey.400" },
    inputActiveBorder: { default: "green.400", _dark: "green.400" },
    inputBg: { default: "white", _dark: "grey.950" },
    inputDisabledBg: { default: "grey.50", _dark: "grey.800" },

    // === TEXT ===
    textPrimary: { default: "grey.900", _dark: "grey.100" }, // Titres, texte principal
    textSecondary: { default: "grey.700", _dark: "grey.200" }, // Descriptions, sous-titres
    textLabel: { default: "grey.500", _dark: "grey.400" }, // Labels, icône+texte, méta
    textMuted: { default: "grey.400", _dark: "grey.600" }, // Optionnel, désactivé
    textSubtle: { default: "grey.300", _dark: "grey.500" }, // Très atténué, sous-descriptions
    textDescription: { default: "grey.600", _dark: "grey.400" }, // Paragraphes de description (distinct de textSecondary)
    textBody: { default: "grey.700", _dark: "grey.300" }, // Corps de texte / icônes secondaires
    textFaint: { default: "grey.400", _dark: "grey.500" }, // Labels très atténués (meta, timestamps)
    textStrong: { default: "grey.900", _dark: "white" }, // Titres à fort contraste (blanc pur en dark)
    textOnBubble: { default: "grey.800", _dark: "grey.100" }, // Texte dans une bulle de chat
    textError: { default: "red.600", _dark: "red.300" }, // Texte d'erreur

    // === SURFACES ===
    // Fond de la coquille applicative (App.tsx, WorkspaceHeader, pages plein écran type
    // Deployment/Settings/AccessControl). Distinct de surfacePrimary : un cran plus sombre
    // en dark (grey.975 vs grey.950), c'est la valeur réellement utilisée à la racine de l'app.
    surfaceAppShell: { default: "white", _dark: "grey.950" },
    surfacePrimary: { default: "white", _dark: "grey.950" }, // Page principale
    surfaceCard: { default: "white", _dark: "grey.900" }, // Cartes
    surfaceModal: { default: "white", _dark: "grey.900" }, // Modales
    surfaceSubtle: { default: "grey.25", _dark: "grey.800" }, // Fond subtil, inputs désactivés
    surfaceHover: { default: "grey.50", _dark: "grey.900" }, // Survol de lignes/cartes
    surfaceThumbnail: { default: "grey.100", _dark: "grey.850" }, // Miniatures, avatars
    surfaceAction: { default: "white", _dark: "grey.800" }, // Bouton d'action secondaire
    tableBg: { default: "white", _dark: "grey.900" },
    bubbleSentBg: { default: "grey.50", _dark: "rgba(255,255,255,0.08)" }, // Bulle de message envoyé
    bubbleErrorBg: { default: "red.50", _dark: "rgba(254,202,202,0.08)" }, // Bulle de réponse en erreur
    bubbleAccentBg: { default: "green.100", _dark: "green.700" }, // Bulle de message accentuée (onboarding)

    // === BORDERS ===
    borderSubtle: { default: "grey.100", _dark: "grey.700" }, // Bordure légère
    borderDefault: { default: "grey.100", _dark: "grey.800" }, // Bordure standard (cartes, séparateurs)
    borderStrong: { default: "grey.200", _dark: "grey.600" }, // Bordure marquée (kbd, inputs)
    borderDivider: { default: "grey.200", _dark: "grey.700" }, // Séparateurs de section
    borderPanel: { default: "grey.200", _dark: "grey.800" }, // Bordure de panneau/chat
    dividerStrong: { default: "grey.700", _dark: "grey.500" }, // Séparateur vertical marqué (panneaux côte à côte)
    dotInactive: { default: "grey.300", _dark: "grey.700" }, // Puce/indicateur inactif
    borderError: { default: "red.200", _dark: "red.800" }, // Bordure d'état d'erreur
    borderAccentCard: { default: "green.200", _dark: "green.300" }, // Bordure de carte accentuée
    borderAccentCardActive: { default: "green.400", _dark: "green.500" }, // Bordure de carte accentuée, état actif
    borderAccentCardMuted: { default: "green.200", _dark: "green.700" }, // Bordure de carte accentuée, état atténué

    // === TOOLTIP ===
    tooltipBg: { default: "grey.700", _dark: "green.600" }, // Fond de tooltip (déjà repris tel quel dans plusieurs sidebars)

    // === SKELETON ===
    skeletonStart: { default: "grey.100", _dark: "grey.800" },
    skeletonEnd: { default: "grey.200", _dark: "grey.700" },

    // === TREND (indicateurs de variation) ===
    trendPositive: { default: "green.600", _dark: "green.400" },
    trendNeutral: { default: "orange.500", _dark: "orange.300" },
    trendNegative: { default: "red.500", _dark: "red.400" },

    accentCardBg: { default: "green.50", _dark: "grey.850" }, // Carte sélectionnée/active
    accentIconBg: { default: "green.100", _dark: "grey.800" }, // Fond icône accent
    iconAccent: { default: "green.500", _dark: "green.400" }, // Icône accentuée (vert marque)
    iconStepInactive: { default: "grey.500", _dark: "grey.900" }, // Icône d'étape inactive sur fond accentué
    thinkingDotColor: { default: "#38A169", _dark: "#68D391" }, // Puce d'indicateur "en train de réfléchir"
    errorIconAccent: { default: "#ef4444", _dark: "#f87171" }, // Icône d'alerte/erreur
    bubbleAccentText: { default: "green.800", _dark: "grey.100" }, // Texte dans bubbleAccentBg
    sidebarBorder: { default: "rgba(0,0,0,0.07)", _dark: "rgba(255,255,255,0.07)" }, // Bordure de sidebar
    listItemActiveBg: { default: "rgba(0,0,0,0.05)", _dark: "rgba(255,255,255,0.08)" }, // Fond d'item de liste actif
    listItemHoverBg: { default: "rgba(0,0,0,0.03)", _dark: "rgba(255,255,255,0.05)" }, // Fond d'item de liste survolé
    separatorDashAccent: { default: "#D1D5DB", _dark: "rgba(52, 211, 169, 0.3)" },

    bgAgentProduction: { default: "#F0FDF4", _dark: "#68ffb871" },

    backgroundDefault: { default: "white", _dark: "grey.900" },
    secondBackgroundDefault: { default: "grey.25", _dark: "grey.950" },
};

export default colorTokens;
