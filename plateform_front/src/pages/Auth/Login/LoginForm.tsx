import { VStack } from "@chakra-ui/react";
import { AuthStepFormProps, LoginFormSteps } from "pages/Auth/Layout/AuthLayout";
import { FC } from "react";

export const LoginForm: FC<AuthStepFormProps> = ({onStepChange, currentStep}) => {
    if (currentStep === LoginFormSteps.LOGIN_PASSWORD)
        return <VStack>Login Password</VStack>;
    if (currentStep === LoginFormSteps.LOGIN_PASSKEY)
        return <VStack>Login Passkey</VStack>;
    return <VStack>Login Email</VStack>;
};
