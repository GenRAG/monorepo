import { FC, ReactNode, useState } from 'react';
import AuthDesktopLayout from 'pages/Auth/Layout/AuthDesktopLayout';
import AuthMobileLayout from 'pages/Auth/Layout/AuthMobileLayout';

import { useAppResponsive } from 'hooks/useAppResponsive';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthLayoutConfig, AuthLayoutContext } from 'pages/Auth/Layout/AuthLayoutContext';

interface AuthTemplateProps {
	children: ReactNode;
	showBackground?: boolean;
	canGoBack?: () => void;
}

export enum RegisterFormSteps {
	REGISTER_EMAIL = 'REGISTER_EMAIL',
	REGISTER_PASSWORD = 'REGISTER_PASSWORD',
	REGISTER_VALIDATE = 'REGISTER_VALIDATE',
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

export const STEP_CONFIG: Record<AuthStepType, { title: string; subTitle: string }> = {
	[LoginFormSteps.LOGIN_EMAIL]: {
		title: 'Welcome back !',
		subTitle: 'Sign in to access your workspace and continue optimizing your RAG pipelines.',
	},
	[LoginFormSteps.LOGIN_PASSWORD]: {
		title: 'Connect to your account',
		subTitle: 'Sign in to access your workspace and continue optimizing your RAG pipelines.',
	},
	[LoginFormSteps.LOGIN_PASSKEY]: {
		title: 'Connect to your account',
		subTitle: 'Sign in to access your workspace and continue optimizing your RAG pipelines.',
	},
	[RegisterFormSteps.REGISTER_EMAIL]: {
		title: 'Create an account',
		subTitle: 'Create your account to start building and optimizing your RAG pipelines with GenRAG.',
	},
	[RegisterFormSteps.REGISTER_PASSWORD]: {
		title: 'Create an account',
		subTitle: 'Create your account to start building and optimizing your RAG pipelines with GenRAG.',
	},
	[RegisterFormSteps.REGISTER_VALIDATE]: {
		title: 'Validate your account',
		subTitle: 'Check your email to verify your account before continuing.',
	},
};

export const STEP_TITLES = Object.fromEntries(
	Object.entries(STEP_CONFIG).map(([step, { title }]) => [step, title])
) as Record<AuthStepType, string>;

export const STEP_SUBTITLES = Object.fromEntries(
	Object.entries(STEP_CONFIG).map(([step, { subTitle }]) => [step, subTitle])
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
