import { FC, useState } from "react";
import { AuthStepType, RegisterFormSteps } from "pages/Auth/Layout/AuthLayout";
import RegisterForm from "pages/Auth/Register/Register";
import { useAuthStepConfig } from "hooks/useAuthStepConfig";

export interface AuthPageProps {
    showBackground: boolean;
}

const Register: FC = () => {
    const [step, setStep] = useState<AuthStepType>(RegisterFormSteps.REGISTER_EMAIL);
    useAuthStepConfig(step, RegisterFormSteps.REGISTER_EMAIL, [RegisterFormSteps.REGISTER_PASSWORD], setStep);

    return <RegisterForm onStepChange={setStep} currentStep={step} />;
};

export default Register;
