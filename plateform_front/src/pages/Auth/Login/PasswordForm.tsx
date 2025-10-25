import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Link as ReachLink, useLocation, useSearchParams } from 'react-router-dom';
import {
	Button,
	chakra,
	Checkbox,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Link,
	Text,
	VStack,
} from '@chakra-ui/react';
import { AuthHeader } from 'pages/Auth/AuthHeader';
import { LoginFormSteps } from 'pages/Auth/Layout/AuthLayout';
//import { LocalStorageKeys } from 'types/localStorage';
//import { useLocalStorage } from 'usehooks-ts';

import { ShowHidePasswordInput } from 'components/Molecules/Inputs/ShowHidePasswordInput';
//import { isParentDemoEnv } from 'demo/utils';
//import { useFcmTokenManager } from 'hooks/auth/useFcmTokenManager';
//import { useTokenManager } from 'hooks/auth/useTokenManager';
//import { getAppEnvironment } from 'hooks/getAppEnvironment';
//import useThemedToast from 'hooks/useThemedToast';
//import { isNativeApp } from 'mobile/utils';
//import { getConnectionDuration, useLazyLoginQuery } from 'services/requests/auth';
//import { useHasPasskeysQuery } from 'services/requests/auth/passkeys';
import colors from 'themeNew/foundations/colors';
import { useLoginMutation } from 'services/auth/auth';
import useThemedToast from 'hooks/useThemedToast';

type PasswordFormType = {
	password: string;
	stayConnected: boolean; // rester connecté
};

//const { isLocal } = getAppEnvironment();

export const PasswordForm: FC<{ email: string; currentStep: LoginFormSteps }> = ({ email, currentStep }) => {
	const location = useLocation();
	const toast = useThemedToast();
	const [searchParams] = useSearchParams();
	const [login, { isLoading: isLoggingIn }] = useLoginMutation();

	//const [doNotAskOnThisDevice] = useLocalStorage(LocalStorageKeys.AUTH.PASSKEYS.DO_NOT_ASK_ON_THIS_DEVICE, false);
	//const { handleFcmToken } = useFcmTokenManager();

	//const [login, { isLoading: isLoggingIn }] = useLazyLoginQuery();
	//const { data: emailHasKeys } = useHasPasskeysQuery({ email });

	//const { redeemToken } = useTokenManager();

	const {
		formState: { errors },
		register,
		handleSubmit,
	} = useForm<PasswordFormType>({
		defaultValues: {
			stayConnected: false,
			//password: isLocal ? '12345678' : '',
		},
	});

	const onSubmit = handleSubmit((data: PasswordFormType) => {
		login({
			email,
			password: data.password,
		})
			.unwrap()
			.then(() => {
			toast({
				title: 'Connexion réussie',
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
			})
			.catch((err) => {
				let message = 'Impossible de se connecter.';
				console.log(err)

				// RTK Query FetchBaseQueryError

				toast({
					title: "Une erreur s'est produite.",
					description: err.data.error.message || message,
					status: 'error',
					duration: 9000,
					isClosable: true,
				});
				});

	});

	return (
		<VStack gap="16px" w="100%">
			<AuthHeader currentStep={currentStep} />

			<chakra.form w="100%" onSubmit={onSubmit}>
				<VStack align="start" gap="24px" w="100%">
					<FormControl>
						<FormLabel color={colors.font.disabled}>Email address</FormLabel>
						<Input type="email" name="email" value={email} autoComplete="current-email" isDisabled isReadOnly />
					</FormControl>
					<VStack align="start" w="100%" gap="24px">
						<FormControl isInvalid={!!errors.password}>
							<FormLabel color="whites.offwhite">Password</FormLabel>
							<ShowHidePasswordInput
								{...register('password', {
									required: true,
									minLength: 8,
									maxLength: 100,
								})}
								placeholder="Minimum 8 caractères"
								autoComplete="new-password"
							/>
							{!!errors.password && <FormErrorMessage>{errors.password?.message}</FormErrorMessage>}
						</FormControl>

						{/*!isNativeApp && (
							<Checkbox {...register('stayConnected')} variant="simple" w="100%">
								<Text variant="body-sm">Rester connecté</Text>
							</Checkbox>
						)*/}
					</VStack>
					<Button
						color="whites.offwhite"
						variant="superSecondary"
						w="100%"
						size="lg"
						isLoading={isLoggingIn}
						type="submit"
						data-cy="cy-connect-btn"
					>
						Sign in
					</Button>
					<VStack w="100%" justifyContent="center">
						<Link as={ReachLink} to={'/mot-de-passe-oublie' + location.search}>
							<Text variant="body-sm-semibold" color="whites.offwhite">Forgot password?</Text>
						</Link>
					</VStack>
				</VStack>
			</chakra.form>
		</VStack>
	);
};
