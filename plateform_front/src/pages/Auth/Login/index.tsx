import AuthLayout, { AuthStepType, LoginFormSteps } from "pages/Auth/Layout/AuthLayout"
import { LoginForm } from "pages/Auth/Login/LoginForm"
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: FC = () => {
    const navigate = useNavigate();
	const [step, setStep] = useState<AuthStepType>(LoginFormSteps.LOGIN_EMAIL);

	const showBackground = step === LoginFormSteps.LOGIN_EMAIL;

	const [prevStep, setPrevStep] = useState<() => void>();

	useEffect(() => {
		if (step === LoginFormSteps.LOGIN_PASSWORD || step === LoginFormSteps.LOGIN_PASSKEY) {
			setPrevStep(() => () => {
				setStep(LoginFormSteps.LOGIN_EMAIL);
			});
		} else {
			setPrevStep(undefined);
		}
	}, [step, navigate]);
    return (
        <AuthLayout showBackground={showBackground} canGoBack={prevStep}>
            <LoginForm onStepChange={setStep} currentStep={step} />
        </AuthLayout>
    )
}

export default Login;