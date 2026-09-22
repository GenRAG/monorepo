import { FC, useEffect, useState } from "react";
import { Heading, VStack, Text } from "@chakra-ui/react";
import { AuthStepType, STEP_SUBTITLES, STEP_TITLES } from "pages/Auth/Layout/AuthLayout";

export const AuthHeader: FC<{ currentStep: AuthStepType }> = ({ currentStep }) => {
    const [title, setTitle] = useState<string>(STEP_TITLES[currentStep] || "Connexion");
    const [subTitle, setSubtitle] = useState<string>(STEP_SUBTITLES[currentStep] || "");

    useEffect(() => {
        setTitle(STEP_TITLES[currentStep]);
        setSubtitle(STEP_SUBTITLES[currentStep] || "");
    }, [currentStep]);

    return (
        <VStack justifyContent="center" w="100%">
            <Heading w="100%" color="textStrong" variant="display-2xl">
                {title}
            </Heading>
            <Text w="100%" color="textSecondary" variant="body-md">
                {subTitle}
            </Text>
        </VStack>
    );
};
