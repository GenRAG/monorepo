import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from 'pages/Auth/Layout/AuthLayout';
import ResetPasswordForm from 'pages/Auth/Password/ResetPassword';
import { useAuthLayout } from 'pages/Auth/Layout/AuthLayoutContext';

const ResetPassword: FC = () => {
	const navigate = useNavigate();
	const { setConfig } = useAuthLayout();

	useEffect(() => {
		setConfig({
			canGoBack: () => navigate('/login'),
			showBackground: false,
		});
	}, [setConfig]);

	return (
		<ResetPasswordForm />
	);
};

export default ResetPassword;
