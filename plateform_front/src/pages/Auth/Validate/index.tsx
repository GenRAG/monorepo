import AuthLayout, {
    AuthStepType,
    RegisterFormSteps,
} from "pages/Auth/Layout/AuthLayout";
import { useAuthLayout } from "pages/Auth/Layout/AuthLayoutContext";
import ValidateAccountForm from "pages/Auth/Validate/ValidateAccountForm";
import { FC, useEffect, useState } from "react";

const Validate: FC = () => {
    const [step, setStep] = useState<AuthStepType>(
        RegisterFormSteps.REGISTER_EMAIL,
    );
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

    return <ValidateAccountForm />;
};

export default Validate;
