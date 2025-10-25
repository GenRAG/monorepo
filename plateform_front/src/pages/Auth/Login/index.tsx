import AuthLayout, { AuthStepType, LoginFormSteps } from "pages/Auth/Layout/AuthLayout"
import { useAuthLayout } from "pages/Auth/Layout/AuthLayoutContext";
import { LoginForm } from "pages/Auth/Login/LoginForm"
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: FC = () => {
	const [step, setStep] = useState<AuthStepType>(LoginFormSteps.LOGIN_EMAIL);
	const { setConfig } = useAuthLayout();

	useEffect(() => {
		setConfig({
			canGoBack: step === LoginFormSteps.LOGIN_PASSWORD || step === LoginFormSteps.LOGIN_PASSKEY
				? () => setStep(LoginFormSteps.LOGIN_EMAIL)
				: undefined,
			showBackground: step === LoginFormSteps.LOGIN_EMAIL,
		});
	}, [step, setConfig]);


    return (
        <LoginForm onStepChange={setStep} currentStep={step} />
    )
}

export default Login;