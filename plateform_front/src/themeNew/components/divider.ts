import { defineStyleConfig } from "@chakra-ui/react";

import colors from "themeNew/foundations/colors";

const Divider = defineStyleConfig({
    baseStyle: {
        // Valeur light inchangée (grey.50, déjà utilisée dans 19 fichiers) — on ajoute
        // uniquement la variante dark manquante, sans changer le rendu existant en light.
        borderColor: { default: colors.grey[50], _dark: colors.grey[700] },
        borderWidth: "1px",
        borderStyle: "solid",
    },
});
export default Divider;
