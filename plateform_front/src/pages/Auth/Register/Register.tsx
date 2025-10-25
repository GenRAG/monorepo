import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as ReachLink, useLocation, useSearchParams } from 'react-router-dom';
import {
	Divider,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Image,
	Input,
	Link,
	Text,
	VStack,
} from '@chakra-ui/react';
import { AuthHeader } from 'pages/Auth/AuthHeader';
import { AuthStepFormProps, RegisterFormSteps } from 'pages/Auth/Layout/AuthLayout';

import Button from 'components/Atoms/Button';
import { useAppResponsive } from 'hooks/useAppResponsive';
import colors from 'themeNew/foundations/colors';
import { validateEmail } from 'utils/validateEmail';
import Google from 'assets/icons/google.svg'
import Microsoft from 'assets/icons/microsoft.png';

import CreateAccountForm from './CreateAccountForm';

const RegisterForm: FC<AuthStepFormProps> = ({ onStepChange, currentStep }) => {
	const isDesktop = useAppResponsive({ base: false, lg: true });
	const [searchParams] = useSearchParams();
	const location = useLocation();

	const [step, setStep] = useState<RegisterFormSteps>(RegisterFormSteps.REGISTER_EMAIL);

	useEffect(() => {
		onStepChange?.(step);
	}, [step, onStepChange]);

	const currentStepValue = currentStep as RegisterFormSteps;

	useEffect(() => {
		setStep(currentStepValue);
	}, [currentStepValue]);

	const {
		register,
		watch,
		formState: { errors },
	} = useForm({ defaultValues: { email: searchParams.get('email') } });
	const enteredEmail = watch('email');

	return (
		<VStack w="100%" gap="32px">
			<VStack>
				<AuthHeader currentStep={currentStep} />

				<HStack wrap="wrap" justify="flex-start" w="100%" gap="0">
					<Text variant="body-sm" color="whites.offwhite" mr={2}>
						Already have an account?
					</Text>
					<Link as={ReachLink} to={{ pathname: '/login', search: location.search }}>
						<Text color="whites.offwhite" variant="body-sm-semibold">Sign in</Text>
					</Link>
				</HStack>
			</VStack>
			<VStack gap="32px" w="100%" align="center" textAlign="center">
				{step === RegisterFormSteps.REGISTER_EMAIL ? (
					<>
						<FormControl isInvalid={!!errors.email}>
							<FormLabel color="whites.offwhite">Adresse email</FormLabel>
							<Input
								{...register('email', { validate: (email) => validateEmail(email ?? undefined) })}
								placeholder="warren.buffett@gmail.com"
								autoComplete="email"
							/>
							{errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
						</FormControl>

						<Button onClick={() => setStep(RegisterFormSteps.REGISTER_PASSWORD)} h="48px" w="100%" variant="superSecondary">
							<Text color={colors.whites.white} variant="body-sm-semibold">
								Create an account
							</Text>
						</Button>
						<>
							<HStack w="100%">
								<Divider borderColor="grey.100" />
								<Text m="auto" variant="body-sm" color="whites.offwhite">
									or
								</Text>
								<Divider borderColor="grey.100" />
							</HStack>
							<VStack w="100%">
								<Button w="100%" variant="secondary" size="lg">
									<HStack justify="center" spacing="8px">
										<Image src={Google} boxSize="24px" />
										<Text>Continue with Google</Text>
									</HStack>
								</Button>
								<Button w="100%" variant="secondary" size="lg">
									<HStack justify="center" spacing="8px">
										<Image src={Microsoft} boxSize="24px" />
										<Text>Continue with Microsoft</Text>
									</HStack>
								</Button>
							</VStack>
						</>
					</>
				) : (
					<CreateAccountForm email={enteredEmail ?? undefined} />
				)}
			</VStack>
		</VStack>
	);
};

export default RegisterForm;
