import { FC, ReactNode } from 'react';
import AuthDesktopLayout from 'pages/Auth/Layout/AuthDesktopLayout';
import AuthMobileLayout from 'pages/Auth/Layout/AuthMobileLayout';

import { useAppResponsive } from 'hooks/useAppResponsive';

interface AuthTemplateProps {
	children: ReactNode;
	showBackground?: boolean;
	canGoBack?: () => void;
}

export enum RegisterFormSteps {
	REGISTER_EMAIL = 'REGISTER_EMAIL',
	REGISTER_PASSWORD = 'REGISTER_PASSWORD',
}

export enum LoginFormSteps {
	LOGIN_EMAIL = 'LOGIN_EMAIL',
	LOGIN_PASSWORD = 'LOGIN_PASSWORD',
	LOGIN_PASSKEY = 'LOGIN_PASSKEY',
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

const stepGroups: { steps: AuthStepType[]; title: string }[] = [
	{ steps: [LoginFormSteps.LOGIN_EMAIL], title: 'Connexion' },
	{ steps: [LoginFormSteps.LOGIN_PASSKEY, LoginFormSteps.LOGIN_PASSWORD], title: 'Connexion à votre compte' },
	{ steps: [RegisterFormSteps.REGISTER_EMAIL, RegisterFormSteps.REGISTER_PASSWORD], title: 'Créer un compte' },
];

const entries = stepGroups.flatMap((group) => group.steps.map((step) => [step, group.title] as const));

export const STEP_TITLES = Object.fromEntries(entries);

const AuthLayout: FC<AuthTemplateProps> = ({ children, showBackground, canGoBack }) => {
	const isMobile = useAppResponsive({ base: true, lg: false });

	if (isMobile) {
		return (
			<AuthMobileLayout showBackground={showBackground} canGoBack={canGoBack}>
				{children}
			</AuthMobileLayout>
		);
	}

	return <AuthDesktopLayout canGoBack={canGoBack}>{children}</AuthDesktopLayout>;
};

export default AuthLayout;
