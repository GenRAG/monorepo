import { AuthStepType, RegisterFormSteps } from "pages/Auth/Layout/AuthLayout";
import ValidateAccountForm from "pages/Auth/Validate/ValidateAccountForm";
import { FC, useState } from "react";
import { useAuthStepConfig } from "hooks/useAuthStepConfig";

const Validate: FC = () => {
    const [step, setStep] = useState<AuthStepType>(RegisterFormSteps.REGISTER_EMAIL);
    useAuthStepConfig(step, RegisterFormSteps.REGISTER_EMAIL, [RegisterFormSteps.REGISTER_PASSWORD], setStep);

    return <ValidateAccountForm />;
};

export default Validate;
