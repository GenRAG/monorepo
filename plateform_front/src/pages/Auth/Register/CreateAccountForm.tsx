import { FC, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    Button,
    chakra,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { useRegisterMutation } from "services/auth/auth";
import useThemedToast from "hooks/useThemedToast";
import { ShowHidePasswordInput } from "components/ui/ShowHidePasswordInput";
import { validateEmail } from "utils/validateEmail";
import mixpanel from "lib/mixpanel";
import { getApiErrorMessage } from "utils/apiError";

type RegisterFormType = {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
};

type CreateAccountFormProps = {
    email: string | undefined;
};

const CreateAccountForm: FC<CreateAccountFormProps> = ({ email }) => {
    const toast = useThemedToast();
    const navigate = useNavigate();

    const [registerUser, { isLoading }] = useRegisterMutation();

    const buttonType = useColorModeValue("superSecondary", "superPrimary");

    const {
        formState: { errors },
        register,
        handleSubmit,
        watch,
    } = useForm<RegisterFormType>({
        criteriaMode: "all",
        defaultValues: {
            email,
        },
    });

    const passwordErrors = useMemo(
        () =>
            errors.password?.types
                ? Object.keys(errors.password?.types).filter((e) => !["required", "maxLength"].includes(e))
                : [],
        [errors.password?.types],
    );
    const onSubmit = handleSubmit((data: RegisterFormType) => {
        registerUser({
            email: data.email,
            password: data.password,
            name: data.name,
        })
            .unwrap()
            .then(async () => {
                mixpanel.track("user_signed_up", { method: "email" });
                await navigate(`/validate?email=${data.email}`, { replace: true });
            })
            .catch((error: unknown) => {
                if (typeof error === "object" && error !== null && "status" in error) {
                    toast({
                        title: "An error occurred.",
                        description: getApiErrorMessage(error) || "Please try again later.",
                        status: "error",
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
                    <FormLabel color="textStrong">Email Address</FormLabel>
                    <Input
                        {...register("email", { validate: validateEmail })}
                        placeholder="john.smith@gmail.com"
                        autoComplete="email"
                        disabled={!!email}
                        color="textStrong"
                    />
                    {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
                </FormControl>
                <FormControl>
                    <FormLabel color="textStrong">Name</FormLabel>
                    <Input
                        {...register("name", { required: true })}
                        placeholder="John Smith"
                        autoComplete="name"
                        color="textStrong"
                    />
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                    <FormLabel color="textStrong">Password</FormLabel>
                    <ShowHidePasswordInput
                        {...register("password", {
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
                        color="textStrong"
                    />
                    {errors.password?.type === "required" && (
                        <FormErrorMessage>This field is required</FormErrorMessage>
                    )}
                    {errors.password?.type === "maxLength" && (
                        <FormErrorMessage>No more than 100 characters</FormErrorMessage>
                    )}

                    {passwordErrors?.length > 0 && (
                        <>
                            <FormErrorMessage>Le mot de passe doit contenir au moins :</FormErrorMessage>
                            {passwordErrors.includes("minLength") && (
                                <FormErrorMessage fontSize="12px">- 8 characters</FormErrorMessage>
                            )}
                            {passwordErrors.includes("symbols") && (
                                <FormErrorMessage fontSize="12px">- 1 symbol</FormErrorMessage>
                            )}
                            {passwordErrors.includes("digits") && (
                                <FormErrorMessage fontSize="12px">- 1 chiffre</FormErrorMessage>
                            )}
                            {passwordErrors.includes("uppercase") && (
                                <FormErrorMessage fontSize="12px">- 1 lettre majuscule</FormErrorMessage>
                            )}
                            {passwordErrors.includes("lowercase") && (
                                <FormErrorMessage fontSize="12px">- 1 lettre minuscule</FormErrorMessage>
                            )}
                        </>
                    )}
                </FormControl>
                <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel color="textStrong">Confirm Password</FormLabel>
                    <ShowHidePasswordInput
                        {...register("confirmPassword", {
                            required: true,
                            minLength: 8,
                            maxLength: 100,
                            validate: (value) => value === watch("password") || "Passwords do not match",
                        })}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        color="textStrong"
                    />
                    {errors.confirmPassword?.type === "required" && (
                        <FormErrorMessage>This field is required</FormErrorMessage>
                    )}
                    {errors.confirmPassword?.type === "minLength" && (
                        <FormErrorMessage>At least 8 characters</FormErrorMessage>
                    )}
                    {errors.confirmPassword?.type === "maxLength" && (
                        <FormErrorMessage>No more than 100 characters</FormErrorMessage>
                    )}
                    {errors.confirmPassword?.message && (
                        <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
                    )}
                </FormControl>
                <Button variant={buttonType} size="lg" w="100%" isLoading={isLoading} type="submit">
                    Sign up
                </Button>
            </VStack>
        </chakra.form>
    );
};

export default CreateAccountForm;
