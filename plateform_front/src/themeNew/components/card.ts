import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(cardAnatomy.keys);

// Reflète le pattern déjà utilisé partout dans l'app (Dashboard/MetricCard,
// Dashboard/AgentsCard, Dashboard/RecentActivityCard...) plutôt que les anciennes
// variantes "gold"/"portfolio", qui n'avaient aucun usage réel et n'avaient jamais
// été adaptées au dark mode.
const Card = defineMultiStyleConfig({
    baseStyle: {
        container: {
            bg: "surfaceCard",
            borderColor: "borderDefault",
            borderWidth: "1px",
            borderRadius: "12px",
            boxShadow: "none",
            position: "relative",
        },
    },

    sizes: {
        none: {
            container: {
                padding: "0px",
            },
        },
        xs: {
            container: {
                padding: "8px",
            },
        },
        sm: {
            container: {
                padding: "16px",
            },
        },
        md: {
            container: {
                padding: { base: "16px", md: "24px" },
            },
        },
    },

    variants: {
        clickable: {
            container: {
                cursor: "pointer",
                transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
                _hover: {
                    borderColor: "borderStrong",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
            },
        },
    },

    defaultProps: {
        size: "md",
    },
});

export default Card;
