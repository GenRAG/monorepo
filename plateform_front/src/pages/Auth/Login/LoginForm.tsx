import { VStack } from "@chakra-ui/react";
import {
    AuthStepFormProps,
    LoginFormSteps,
} from "pages/Auth/Layout/AuthLayout";
import { EmailForm } from "pages/Auth/Login/EmailForm";
import { PasswordForm } from "pages/Auth/Login/PasswordForm";
import { FC, useEffect, useState } from "react";
import { LocalStorageKeys } from "types/localStorage";
import { useLocalStorage } from "usehooks-ts";

export const LoginForm: FC<AuthStepFormProps> = ({
    onStepChange,
    currentStep,
}) => {
    const [rememberedEmail] = useLocalStorage<string>(
        LocalStorageKeys.AUTH.REMEMBERED_EMAIL,
        "",
    );

    const [enteredEmail, setEnteredEmail] = useState<string>(
        rememberedEmail || "",
    );

    const emailOnNext = (email: string): void => {
        setEnteredEmail(email);
        onStepChange(LoginFormSteps.LOGIN_PASSWORD);
    };

    useEffect(() => {
        onStepChange?.(currentStep);
    }, [currentStep, onStepChange]);

    if (currentStep === LoginFormSteps.LOGIN_PASSWORD)
        return <PasswordForm currentStep={currentStep} email={enteredEmail} />;
    if (currentStep === LoginFormSteps.LOGIN_PASSKEY)
        return <VStack>Login Passkey</VStack>;
    return <EmailForm setEmail={emailOnNext} currentStep={currentStep} />;
};
