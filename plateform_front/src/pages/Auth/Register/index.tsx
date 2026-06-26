import { FC, useEffect, useState } from "react";
import { AuthStepType, RegisterFormSteps } from "pages/Auth/Layout/AuthLayout";
import RegisterForm from "pages/Auth/Register/Register";
import { useAuthLayout } from "pages/Auth/Layout/AuthLayoutContext";

export interface AuthPageProps {
    showBackground: boolean;
}

const Register: FC = () => {
    const [step, setStep] = useState<AuthStepType>(RegisterFormSteps.REGISTER_EMAIL);
    const { setConfig } = useAuthLayout();

    useEffect(() => {
        setConfig({
            canGoBack:
                step === RegisterFormSteps.REGISTER_PASSWORD
                    ? () => {
                          setStep(RegisterFormSteps.REGISTER_EMAIL);
                      }
                    : undefined,
            showBackground: step === RegisterFormSteps.REGISTER_EMAIL,
        });
    }, [step, setConfig]);

    return <RegisterForm onStepChange={setStep} currentStep={step} />;
};

export default Register;
