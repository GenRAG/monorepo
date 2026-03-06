import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResetPasswordForm from "pages/Auth/Password/ResetPassword";
import { useAuthLayout } from "pages/Auth/Layout/AuthLayoutContext";

const ResetPassword: FC = () => {
    const navigate = useNavigate();
    const { setConfig } = useAuthLayout();

    useEffect(() => {
        setConfig({
            canGoBack: () => navigate("/login"),
            showBackground: false,
        });
    }, [setConfig, navigate]);

    return <ResetPasswordForm />;
};

export default ResetPassword;
