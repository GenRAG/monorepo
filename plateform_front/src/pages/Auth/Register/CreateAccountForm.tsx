import { FC, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
	Button,
	chakra,
	Checkbox,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Text,
	VStack,
} from '@chakra-ui/react';
//import { confirmCodePromoRules } from 'pagesNew/Auth/utils';
import { useRegisterMutation } from 'services/auth/auth';
import useThemedToast from 'hooks/useThemedToast';
import { ShowHidePasswordInput } from 'components/Molecules/Inputs/ShowHidePasswordInput';
import { validateEmail } from 'utils/validateEmail';

/*import ErrorFieldMessage from 'components/Basics/Inputs/ErrorMessage';
import SuccessMessage from 'components/Basics/Inputs/SuccessMessage';
import { ShowHidePasswordInput } from 'composantsNew/Molecules/Inputs/ShowHidePasswordInput';
import { isDemoEnv, isParentDemoEnv } from 'demo/utils';
import { useFcmTokenManager } from 'hooks/auth/useFcmTokenManager';
import { useTokenManager } from 'hooks/auth/useTokenManager';
import { usePartnerParams } from 'hooks/usePartnerParams';
import useThemedToast from 'hooks/useThemedToast';
import eventTracker from 'services/events/eventTracker';
import { useRegisterMutation } from 'services/requests/auth';
import { useGetCorporateCompanyByIdQuery } from 'services/requests/corporate';
import { codePromoLoader, isNone } from 'utils/functions';
import { emailPattern, validateEmail } from 'utils/validations/email';*/

type RegisterFormType = {
	email: string;
	password: string;
	confirmPassword: string;
	promo?: string;
	corporateEmail?: string;
};

type CreateAccountFormProps = {
	email: string | undefined;
};

const CreateAccountForm: FC<CreateAccountFormProps> = ({ email }) => {
	const toast = useThemedToast();
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();

	const [registerUser, { isLoading }] = useRegisterMutation();

	/*const partner = usePartnerParams();
	const { data: corporateData } = useGetCorporateCompanyByIdQuery(searchParams.get('corporate')!, {
		skip: !searchParams.has('corporate'),
	});
	const { redeemToken } = useTokenManager();*/

	const [invalidSyntax, setInvalidSyntax] = useState<string>();
	const [promoMessage, setPromoMessage] = useState<string>();
	const [promoChecked, setPromoChecked] = useState<boolean>(searchParams.has('promo'));
	//const { handleFcmToken } = useFcmTokenManager();

	const {
		formState: { errors },
		register,
		handleSubmit,
		watch,
	} = useForm<RegisterFormType>({
		criteriaMode: 'all',
		defaultValues: {
			email,
			promo:
				searchParams.get('promo') ??
				searchParams.get('code') ?? // `code` for backward compatibility
				undefined,
			corporateEmail: searchParams.get('corporateEmail') ?? undefined,
		},
	});

	const passwordErrors = useMemo(
		() =>
			errors.password?.types
				? Object.keys(errors.password?.types).filter((e) => !['required', 'maxLength'].includes(e))
				: [],
		[errors.password?.types],
	);

	const onSubmit = handleSubmit((data: RegisterFormType) => {
		//const comesFromDemo = isParentDemoEnv || isDemoEnv;
		const redirectLink = searchParams.get('redirect');
		registerUser({
			email: data.email,
			password: data.password,
			/*comesFromDemo,
			corporateEmail: data.corporateEmail,
			partner: partner.name,
			promo: promoChecked ? data.promo?.toUpperCase() : undefined,
			redirect: redirectLink ?? undefined,*/
		})
			.unwrap()
			.then((authResponse) => {
				/*redeemToken(authResponse, {
					partner: partner.name,
					redirect: `/valider-email${location.search}`,
					comesFromDemo: comesFromDemo,
				});
				handleFcmToken();
				if (redirectLink) eventTracker.pipedream.registerInterest(data.email, redirectLink || '');*/
				console.log('authResponse', authResponse);
				navigate(`/validate?email=${data.email}`, { replace: true });
			})
			.catch((error) => {
				if ('status' in error) {
					toast({
						title: "Une erreur s'est produite.",
						description: (error.data as { message: string })?.message || "Impossible de valider l'inscription.",
						status: 'error',
						duration: 9000,
						isClosable: true,
					});
				}
			});
	});

	return (
		<chakra.form w="100%" onSubmit={onSubmit}>
			<VStack align="center" gap="24px" w="100%">
				<FormControl isInvalid={!!errors.email}>
					<FormLabel color="whites.offwhite">Email Address</FormLabel>
					<Input
						{...register('email', { validate: validateEmail })}
						placeholder="warren.buffett@gmail.com"
						autoComplete="email"
					/>
					{errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
				</FormControl>
				<FormControl isInvalid={!!errors.password}>
					<FormLabel color="whites.offwhite">Password</FormLabel>
					<ShowHidePasswordInput
						{...register('password', {
							required: true,
							minLength: 8,
							maxLength: 100,
							validate: {
								uppercase: (value) => /[A-Z]/.test(value),
								lowercase: (value) => /[a-z]/.test(value),
								symbols: (value) => /\W/.test(value),
								digits: (value) => /\d/.test(value),
							},
						})}
						placeholder="Minimum 8 characters"
						autoComplete="new-password"
					/>
					{errors.password?.type === 'required' && <FormErrorMessage>This field is required</FormErrorMessage>}
					{errors.password?.type === 'maxLength' && <FormErrorMessage>No more than 100 characters</FormErrorMessage>}

					{passwordErrors?.length > 0 && (
						<>
							<FormErrorMessage>Password must contain at least:</FormErrorMessage>
							{passwordErrors.includes('minLength') && (
								<FormErrorMessage fontSize="12px">- 8 characters</FormErrorMessage>
							)}
							{passwordErrors.includes('symbols') && <FormErrorMessage fontSize="12px">- One symbol</FormErrorMessage>}
							{passwordErrors.includes('digits') && <FormErrorMessage fontSize="12px">- One digit</FormErrorMessage>}
							{passwordErrors.includes('uppercase') && (
								<FormErrorMessage fontSize="12px">- One uppercase letter</FormErrorMessage>
							)}
							{passwordErrors.includes('lowercase') && (
								<FormErrorMessage fontSize="12px">- One lowercase letter</FormErrorMessage>
							)}
						</>
					)}
				</FormControl>
				<FormControl isInvalid={!!errors.confirmPassword}>
					<FormLabel color="whites.offwhite">Confirm Password</FormLabel>
					<ShowHidePasswordInput
						{...register('confirmPassword', {
							required: true,
							minLength: 8,
							maxLength: 100,
							validate: (value) => value === watch('password') || 'Passwords do not match',
						})}
						placeholder="Minimum 8 characters"
						autoComplete="new-password"
					/>
					{errors.confirmPassword?.type === 'required' && <FormErrorMessage>This field is required</FormErrorMessage>}
					{errors.confirmPassword?.type === 'minLength' && <FormErrorMessage>At least 8 characters</FormErrorMessage>}
					{errors.confirmPassword?.type === 'maxLength' && (
						<FormErrorMessage>No more than 100 characters</FormErrorMessage>
					)}
					{errors.confirmPassword?.message && <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>}
				</FormControl>
				<Button variant="superSecondary" size="lg" w="100%" isLoading={isLoading} type="submit">
					Sign up
				</Button>
			</VStack>
		</chakra.form>
	);
};

export default CreateAccountForm;
