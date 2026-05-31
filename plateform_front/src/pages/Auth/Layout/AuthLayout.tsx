import { FC, useState } from "react";
import AuthDesktopLayout from "pages/Auth/Layout/AuthDesktopLayout";
import AuthMobileLayout from "pages/Auth/Layout/AuthMobileLayout";

import { useAppResponsive } from "hooks/useAppResponsive";
import { Outlet } from "react-router-dom";
import { AuthLayoutConfig, AuthLayoutContext } from "pages/Auth/Layout/AuthLayoutContext";

export enum RegisterFormSteps {
    REGISTER_EMAIL = "REGISTER_EMAIL",
    REGISTER_PASSWORD = "REGISTER_PASSWORD",
    REGISTER_VALIDATE = "REGISTER_VALIDATE",
}

export enum LoginFormSteps {
    LOGIN_EMAIL = "LOGIN_EMAIL",
    LOGIN_PASSWORD = "LOGIN_PASSWORD",
    LOGIN_PASSKEY = "LOGIN_PASSKEY",
}

export const AuthSteps = {
    ...LoginFormSteps,
    ...RegisterFormSteps,
} as const;

export type AuthStepType = (typeof AuthSteps)[keyof typeof AuthSteps];

export interface AuthStepFormProps {
    onStepChange: (step: AuthStepType) => void;
    currentStep: AuthStepType;
}

export const STEP_CONFIG: Record<AuthStepType, { title: string; subTitle: string }> = {
    [LoginFormSteps.LOGIN_EMAIL]: {
        title: "Bon retour parmi nous !",
        subTitle: "Connectez-vous pour accéder à votre espace de travail et continuer à optimiser vos pipelines RAG.",
    },
    [LoginFormSteps.LOGIN_PASSWORD]: {
        title: "Connectez-vous à votre compte",
        subTitle: "Connectez-vous pour accéder à votre espace de travail et continuer à optimiser vos pipelines RAG.",
    },
    [LoginFormSteps.LOGIN_PASSKEY]: {
        title: "Connectez-vous à votre compte",
        subTitle: "Connectez-vous pour accéder à votre espace de travail et continuer à optimiser vos pipelines RAG.",
    },
    [RegisterFormSteps.REGISTER_EMAIL]: {
        title: "Créer un compte",
        subTitle: "Créez votre compte pour commencer à construire et optimiser vos pipelines RAG avec GenRAG.",
    },
    [RegisterFormSteps.REGISTER_PASSWORD]: {
        title: "Créer un compte",
        subTitle: "Créez votre compte pour commencer à construire et optimiser vos pipelines RAG avec GenRAG.",
    },
    [RegisterFormSteps.REGISTER_VALIDATE]: {
        title: "Validez votre compte",
        subTitle: "Vérifiez votre e-mail pour confirmer votre compte avant de continuer.",
    },
};

export const STEP_TITLES = Object.fromEntries(
    Object.entries(STEP_CONFIG).map(([step, { title }]) => [step, title]),
) as Record<AuthStepType, string>;

export const STEP_SUBTITLES = Object.fromEntries(
    Object.entries(STEP_CONFIG).map(([step, { subTitle }]) => [step, subTitle]),
) as Record<AuthStepType, string>;

const AuthLayout: FC = () => {
    const isMobile = useAppResponsive({ base: true, lg: false });

    const [config, setConfig] = useState<AuthLayoutConfig>({
        showBackground: true,
        canGoBack: undefined,
    });

    const value = { ...config, setConfig };

    if (isMobile) {
        return (
            <AuthLayoutContext.Provider value={value}>
                <AuthMobileLayout showBackground={config.showBackground} canGoBack={config.canGoBack}>
                    <Outlet />
                </AuthMobileLayout>
            </AuthLayoutContext.Provider>
        );
    }

    return (
        <AuthLayoutContext.Provider value={value}>
            <AuthDesktopLayout canGoBack={config.canGoBack}>
                <Outlet />
            </AuthDesktopLayout>
        </AuthLayoutContext.Provider>
    );
};

export default AuthLayout;
