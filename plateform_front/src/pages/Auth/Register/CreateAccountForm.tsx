import { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Button,
    chakra,
    Checkbox,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { useRegisterMutation } from "services/auth/auth";
import useThemedToast from "hooks/useThemedToast";
import { ShowHidePasswordInput } from "components/System/Molecules/Inputs/ShowHidePasswordInput";
import { validateEmail } from "utils/validateEmail";

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
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [registerUser, { isLoading }] = useRegisterMutation();

    const buttonType = useColorModeValue("superSecondary", "superPrimary");
    //const { handleFcmToken } = useFcmTokenManager();

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
                ? Object.keys(errors.password?.types).filter(
                      (e) => !["required", "maxLength"].includes(e),
                  )
                : [],
        [errors.password?.types],
    );
    const labelColor = useColorModeValue("grey.900", "whites.offwhite");
    const fieldTextColor = useColorModeValue("black", "whites.offwhite");

    const onSubmit = handleSubmit((data: RegisterFormType) => {
        registerUser({
            email: data.email,
            password: data.password,
            name: data.name,
        })
            .unwrap()
            .then((authResponse) => {
                console.log("authResponse", authResponse);
                navigate(`/validate?email=${data.email}`, { replace: true });
            })
            .catch((error) => {
                if ("status" in error) {
                    toast({
                        title: "An error occurred.",
                        description:
                            error.data.error.message ||
                            "Please try again later.",
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
                    <FormLabel color={labelColor}>Email Address</FormLabel>
                    <Input
                        {...register("email", { validate: validateEmail })}
                        placeholder="john.smith@gmail.com"
                        autoComplete="email"
                        disabled={!!email}
                        color={fieldTextColor}
                    />
                    {errors.email && (
                        <FormErrorMessage>
                            {errors.email.message}
                        </FormErrorMessage>
                    )}
                </FormControl>
                <FormControl>
                    <FormLabel color={labelColor}>Name</FormLabel>
                    <Input
                        placeholder="John Smith"
                        autoComplete="name"
                        color={fieldTextColor}
                    />
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                    <FormLabel color={labelColor}>Password</FormLabel>
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
                        color={fieldTextColor}
                    />
                    {errors.password?.type === "required" && (
                        <FormErrorMessage>
                            This field is required
                        </FormErrorMessage>
                    )}
                    {errors.password?.type === "maxLength" && (
                        <FormErrorMessage>
                            No more than 100 characters
                        </FormErrorMessage>
                    )}

                    {passwordErrors?.length > 0 && (
                        <>
                            <FormErrorMessage>
                                Password must contain at least:
                            </FormErrorMessage>
                            {passwordErrors.includes("minLength") && (
                                <FormErrorMessage fontSize="12px">
                                    - 8 characters
                                </FormErrorMessage>
                            )}
                            {passwordErrors.includes("symbols") && (
                                <FormErrorMessage fontSize="12px">
                                    - One symbol
                                </FormErrorMessage>
                            )}
                            {passwordErrors.includes("digits") && (
                                <FormErrorMessage fontSize="12px">
                                    - One digit
                                </FormErrorMessage>
                            )}
                            {passwordErrors.includes("uppercase") && (
                                <FormErrorMessage fontSize="12px">
                                    - One uppercase letter
                                </FormErrorMessage>
                            )}
                            {passwordErrors.includes("lowercase") && (
                                <FormErrorMessage fontSize="12px">
                                    - One lowercase letter
                                </FormErrorMessage>
                            )}
                        </>
                    )}
                </FormControl>
                <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel color={labelColor}>Confirm Password</FormLabel>
                    <ShowHidePasswordInput
                        {...register("confirmPassword", {
                            required: true,
                            minLength: 8,
                            maxLength: 100,
                            validate: (value) =>
                                value === watch("password") ||
                                "Passwords do not match",
                        })}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        color={fieldTextColor}
                    />
                    {errors.confirmPassword?.type === "required" && (
                        <FormErrorMessage>
                            This field is required
                        </FormErrorMessage>
                    )}
                    {errors.confirmPassword?.type === "minLength" && (
                        <FormErrorMessage>
                            At least 8 characters
                        </FormErrorMessage>
                    )}
                    {errors.confirmPassword?.type === "maxLength" && (
                        <FormErrorMessage>
                            No more than 100 characters
                        </FormErrorMessage>
                    )}
                    {errors.confirmPassword?.message && (
                        <FormErrorMessage>
                            {errors.confirmPassword?.message}
                        </FormErrorMessage>
                    )}
                </FormControl>
                <Button
                    variant={buttonType}
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    type="submit"
                >
                    Sign up
                </Button>
            </VStack>
        </chakra.form>
    );
};

export default CreateAccountForm;
