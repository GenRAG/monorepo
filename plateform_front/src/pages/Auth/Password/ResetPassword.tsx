import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as ReachLink, useLocation } from 'react-router-dom';
import {
	chakra,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Link,
	Text,
	useColorModeValue,
	VStack,
} from '@chakra-ui/react';

import { Button } from '@chakra-ui/react';
import useThemedToast from 'hooks/useThemedToast';
import { validateEmail } from 'utils/validateEmail';
import { useResetPasswordMutation } from 'services/auth/auth';

type ResetPasswordFormType = {
	email: string;
};

const ResetPasswordForm: FC = () => {
	const toast = useThemedToast();
	const [resetPasswordQuery, { isLoading }] = useResetPasswordMutation();

	const {
		formState: { errors },
		register,
		handleSubmit,
	} = useForm<ResetPasswordFormType>({
		reValidateMode: 'onSubmit',
	});

	const onSubmit = handleSubmit(({ email }: ResetPasswordFormType) => {
		resetPasswordQuery({ email })
			.unwrap()
			.then(() => {
				toast({
					status: 'success',
					title: 'An email has been sent',
					description: 'Please check your inbox to reset your password.',
					duration: 4000,
					isClosable: true,
				});
			})
			.catch((error) => {
				if ('status' in error) {
					toast({
						title: "An error occurred.",
						description: error.data.error.message || 'Please try again later.',
						status: 'error',
						duration: 9000,
						isClosable: true,
					});
				}
			});
	});

	return (
		<VStack gap="24px">
			<Heading variant="display-lg" color="whites.offwhite" textAlign="center">
				Reset your password
			</Heading>

			<chakra.form w="100%" onSubmit={onSubmit}>
				<VStack gap={6}>
					<FormControl isInvalid={!!errors.email}>
						<FormLabel color="whites.offwhite">Email address of the lost account</FormLabel>
						<Input
							{...register('email', { validate: validateEmail })}
							placeholder="john.smith@gmail.com"
							autoComplete="email"
							color={useColorModeValue("black", "whites.offwhite")}
						/>
						{errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
					</FormControl>

					<Button variant="superSecondary" size="lg" w="100%" isLoading={isLoading} type="submit">
						Reset your password
					</Button>

					<Flex justify="space-between">
						<Link as={ReachLink} to={'/login'}>
							<Text variant="body-sm" color="whites.offwhite">
								I know my password
							</Text>
						</Link>
					</Flex>
				</VStack>
			</chakra.form>
		</VStack>
	);
};

export default ResetPasswordForm;
