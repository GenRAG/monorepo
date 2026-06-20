import React from "react";
import { Text, useColorModeValue } from "@chakra-ui/react";
import Banner, { GenragBannerProps } from "components/ui/Banner";

interface OnboardingStepBannerProps extends Omit<GenragBannerProps, "title" | "children"> {
    current: number;
    max: number;
}

const OnboardingStepBanner: React.FC<OnboardingStepBannerProps> = ({ current, max, ...bannerProps }) => {
    const remaining = Math.max(0, max - current);
    const disclaimerColor = useColorModeValue("grey.500", "grey.200");

    const variant = remaining === 0 ? "red" : remaining === 1 ? "orange" : "grey";

    return (
        <Banner borderRadius="12px" variant={variant} size="xs" title="Messages de test" {...bannerProps}>
            <Text fontSize="xs" color={disclaimerColor}>
                {remaining > 0
                    ? `${remaining} message${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""} · ${current}/${max} utilisés`
                    : `Limite atteinte · ${current}/${max} messages utilisés`}
            </Text>
        </Banner>
    );
};

export default OnboardingStepBanner;
