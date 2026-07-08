import React from "react";
import { Text, useColorModeValue } from "@chakra-ui/react";
import { useGetCreditBalanceQuery } from "services/credit/credit";
import Banner, { GenragBannerProps } from "components/ui/Banner";

interface CreditConsumptionBannerProps extends Omit<GenragBannerProps, "title" | "children"> {
    workspaceId?: string | null;
    creditsPerMessage?: number;
}

const CreditConsumptionBanner: React.FC<CreditConsumptionBannerProps> = ({
    workspaceId,
    creditsPerMessage = 1,
    ...bannerProps
}) => {
    const { data: creditBalance } = useGetCreditBalanceQuery(workspaceId ?? "", {
        skip: !workspaceId,
    });
    const disclaimerColor = useColorModeValue("grey.500", "grey.200");
    const balance = creditBalance?.balance;

    return (
        <Banner variant="blue" size="xs" title="Crédits de test" {...bannerProps}>
            <Text fontSize="xs" color={disclaimerColor}>
                Chaque message consomme {creditsPerMessage} crédit
                {creditsPerMessage !== 1 ? "s" : ""}
                {balance !== undefined ? ` · Solde : ${balance} crédit${balance !== 1 ? "s" : ""}` : ""}
            </Text>
        </Banner>
    );
};

export default CreditConsumptionBanner;
