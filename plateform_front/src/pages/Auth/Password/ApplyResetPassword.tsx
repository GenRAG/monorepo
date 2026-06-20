import { FC } from "react";
import { useForm } from "react-hook-form";
import { Link as ReachLink, useNavigate, useSearchParams } from "react-router-dom";
import {
    Button,
    chakra,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Link,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";

import { ShowHidePasswordInput } from "components/ui/ShowHidePasswordInput";

import useThemedToast from "hooks/useThemedToast";
import { useApplyResetPasswordMutation } from "services/auth/auth";

type ApplyResetFormType = {
    password: string;
    confirmPassword: string;
};

const ApplyResetPassword: FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useThemedToast();
    const buttonType = useColorModeValue("superSecondary", "superPrimary");
    const labelColor = useColorModeValue("grey.900", "whites.offwhite");
    const fieldTextColor = useColorModeValue("black", "whites.offwhite");
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const [applyResetPassword, { isLoading }] = useApplyResetPasswordMutation();

    const {
        formState: { errors },
        register,
        handleSubmit,
    } = useForm<ApplyResetFormType>({
        reValidateMode: "onSubmit",
    });

    const onSubmit = handleSubmit(({ password }: ApplyResetFormType) => {
        applyResetPassword({
            password,
            token: Number(token),
            email: email || "",
        })
            .unwrap()
            .then(async () => {
                toast({
                    status: "success",
                    title: "Password reset successfully!",
                    description: "You can now log in with your new password.",
                    duration: 4000,
                    isClosable: true,
                });
                await navigate("/login");
            })
            .catch((error) => {
                if ("status" in error) {
                    toast({
                        title: "An error occurred.",
                        description: error.data.error.message || "Please try again later.",
                        status: "error",
                        duration: 9000,
                        isClosable: true,
                    });
                }
            });
    });

    return (
        <VStack gap="24px">
            <Heading variant="display-lg" color="whites.offwhite" textAlign="center">
                Reinitialiser votre mot de passe
            </Heading>

            <chakra.form w="100%" onSubmit={onSubmit}>
                <VStack align="start" gap="16px" w="100%">
                    <VStack align="left" gap="8px" w="100%">
                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel color={labelColor}>Mot de passe</FormLabel>
                            <ShowHidePasswordInput
                                {...register("password", {
                                    required: true,
                                    minLength: 8,
                                    maxLength: 100,
                                })}
                                placeholder="Minimum 8 characters"
                                autoComplete="new-password"
                                type="password"
                                color={fieldTextColor}
                            />
                            {errors.password?.type === "required" && (
                                <FormErrorMessage>Ce champ est requis</FormErrorMessage>
                            )}
                            {errors.password?.type === "minLength" && (
                                <FormErrorMessage>Le mot de passe doit contenir au moins 8 caractères</FormErrorMessage>
                            )}
                            {errors.password?.type === "maxLength" && (
                                <FormErrorMessage>Le mot de passe ne peut pas dépasser 100 caractères</FormErrorMessage>
                            )}
                        </FormControl>
                    </VStack>

                    <VStack align="left" gap="8px" w="100%">
                        <FormControl isInvalid={!!errors.confirmPassword}>
                            <FormLabel color={labelColor}>Confirmer le mot de passe</FormLabel>
                            <ShowHidePasswordInput
                                {...register("confirmPassword", {
                                    required: true,
                                    minLength: 8,
                                    maxLength: 100,
                                })}
                                placeholder="Minimum 8 characters"
                                type="password"
                                autoComplete="new-password"
                                color={fieldTextColor}
                            />
                            {errors.confirmPassword?.type === "required" && (
                                <FormErrorMessage>This field is required</FormErrorMessage>
                            )}
                            {errors.confirmPassword?.type === "minLength" && (
                                <FormErrorMessage>Password must be at least 8 characters long</FormErrorMessage>
                            )}
                            {errors.confirmPassword?.type === "maxLength" && (
                                <FormErrorMessage>Password cannot be longer than 100 characters</FormErrorMessage>
                            )}
                        </FormControl>
                    </VStack>

                    <Button variant={buttonType} size="lg" w="100%" isLoading={isLoading} type="submit">
                        Changer mon mot de passe
                    </Button>
                </VStack>
            </chakra.form>
            <Flex justify="space-between">
                <Link as={ReachLink} to={"/login"}>
                    <Text variant="body-sm" color="whites.offwhite">
                        Je connais mon mot de passe
                    </Text>
                </Link>
            </Flex>
        </VStack>
    );
};

export default ApplyResetPassword;
