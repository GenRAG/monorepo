import { Box } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { RagModel } from "types/models/models";
import { getAgentAvatar } from "utils/agentAvatar";
import { getProviderSlug, useProviderLogo } from "utils/models/providerLogo";

const SIZES = {
  sm: { box: "28px", logo: "16px" },
  md: { box: "36px", logo: "20px" },
} as const;

/** Logo du provider du modèle (models.dev), ou la lettre colorée du modèle si aucun logo n'existe. */
export const ModelAvatar = ({
  model,
  size = "md",
}: {
  model: Pick<RagModel, "id" | "name" | "provider">;
  size?: "sm" | "md";
}) => {
  const logo = useProviderLogo(getProviderSlug(model.id, model.provider));
  const avatarStyle = getAgentAvatar(model.name);

  if (!logo) {
    return (
      <BoxIcon
        size={size}
        letters={model.name.charAt(0).toUpperCase()}
        bg={avatarStyle.bg}
        color={avatarStyle.color}
      />
    );
  }

  return (
    <Box
      w={SIZES[size].box}
      h={SIZES[size].box}
      borderRadius="8px"
      bg="accentIconBg"
      color="textPrimary"
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      aria-hidden
    >
      <Box
        w={SIZES[size].logo}
        h={SIZES[size].logo}
        bg="currentColor"
        sx={{
          maskImage: `url("${logo}")`,
          WebkitMaskImage: `url("${logo}")`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
    </Box>
  );
};
