import { FC } from "react";
import { useForm } from "react-hook-form";
import { Link as ReachLink, useLocation, useNavigate } from "react-router-dom";
import {
    Button,
    chakra,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Link,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { AuthHeader } from "components/Auth/AuthHeader";
import { LoginFormSteps } from "pages/Auth/Layout/AuthLayout";
import { ShowHidePasswordInput } from "components/ui/ShowHidePasswordInput";
import colors from "themeNew/foundations/colors";
import { useLoginMutation, useGetMeQuery } from "services/auth/auth";
import useThemedToast from "hooks/useThemedToast";
import { useAuth } from "app/AuthContext";

type PasswordFormType = {
    password: string;
    stayConnected: boolean;
};

export const PasswordForm: FC<{
    email: string;
    currentStep: LoginFormSteps;
}> = ({ email, currentStep }) => {
    const location = useLocation();
    const toast = useThemedToast();
    const [login, { isLoading: isLoggingIn }] = useLoginMutation();
    const navigate = useNavigate();
    const { login: setLoggedIn } = useAuth();
    const { refetch: refetchMe } = useGetMeQuery();
    const fieldTextColor = useColorModeValue("grey.800", "grey.100");

    const {
        formState: { errors },
        register,
        handleSubmit,
    } = useForm<PasswordFormType>({
        defaultValues: {
            stayConnected: false,
        },
    });

    const buttonType = useColorModeValue("superSecondary", "superPrimary");

    const onSubmit = handleSubmit(async (data: PasswordFormType) => {
        try {
            await login({
                email,
                password: data.password,
            }).unwrap();

            await refetchMe();

            setLoggedIn();

            toast({
                title: "Connexion réussie",
                description: "Bienvenue",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setTimeout(async () => {
                await navigate("/");
            }, 100);
        } catch (err: any) {
            const message = "Une erreur est survenue lors de la connexion. Veuillez réessayer.";

            toast({
                title: "Une erreur est survenue.",
                description: err?.data?.error?.message || message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    });

    return (
        <VStack gap="16px" w="100%">
            <AuthHeader currentStep={currentStep} />

            <chakra.form w="100%" onSubmit={onSubmit}>
                <VStack align="start" gap="24px" w="100%">
                    <FormControl>
                        <FormLabel color={colors.font.disabled}>Adresse Email</FormLabel>
                        <Input
                            type="email"
                            name="email"
                            value={email}
                            autoComplete="current-email"
                            isDisabled
                            isReadOnly
                        />
                    </FormControl>
                    <VStack align="start" w="100%" gap="24px">
                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel color={useColorModeValue("grey.900", "whites.offwhite")}>Mot de passe</FormLabel>
                            <ShowHidePasswordInput
                                {...register("password", {
                                    required: true,
                                    minLength: 8,
                                    maxLength: 100,
                                })}
                                placeholder="Minimum 8 characters"
                                autoComplete="new-password"
                                color={fieldTextColor}
                            />
                            {!!errors.password && <FormErrorMessage>{errors.password?.message}</FormErrorMessage>}
                        </FormControl>
                    </VStack>
                    <Button
                        color={useColorModeValue("white", "whites")}
                        variant={buttonType}
                        w="100%"
                        size="lg"
                        isLoading={isLoggingIn}
                        type="submit"
                        data-cy="cy-connect-btn"
                    >
                        Connectez-vous
                    </Button>
                    <VStack w="100%" justifyContent="center">
                        <Link as={ReachLink} to={"/reset-password" + location.search}>
                            <Text variant="body-sm-semibold" color={useColorModeValue("grey.900", "whites.offwhite")}>
                                Mot de passe oublié ?
                            </Text>
                        </Link>
                    </VStack>
                </VStack>
            </chakra.form>
        </VStack>
    );
};
