import { AuthStepType, LoginFormSteps } from "pages/Auth/Layout/AuthLayout";
import { LoginForm } from "pages/Auth/Login/LoginForm";
import { FC, useState } from "react";
import { useAuthStepConfig } from "hooks/useAuthStepConfig";

const Login: FC = () => {
    const [step, setStep] = useState<AuthStepType>(LoginFormSteps.LOGIN_EMAIL);
    useAuthStepConfig(
        step,
        LoginFormSteps.LOGIN_EMAIL,
        [LoginFormSteps.LOGIN_PASSWORD, LoginFormSteps.LOGIN_PASSKEY],
        setStep,
    );

    return <LoginForm onStepChange={setStep} currentStep={step} />;
};

export default Login;
