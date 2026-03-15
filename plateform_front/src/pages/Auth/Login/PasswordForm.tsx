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
import { AuthHeader } from "pages/Auth/AuthHeader";
import { LoginFormSteps } from "pages/Auth/Layout/AuthLayout";
import { ShowHidePasswordInput } from "components/Molecules/Inputs/ShowHidePasswordInput";
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

    const {
        formState: { errors },
        register,
        handleSubmit,
    } = useForm<PasswordFormType>({
        defaultValues: {
            stayConnected: false,
        },
    });

    const onSubmit = handleSubmit(async (data: PasswordFormType) => {
        try {
            await login({
                email,
                password: data.password,
            }).unwrap();

            await refetchMe();

            setLoggedIn();

            toast({
                title: "Successfully logged in!",
                description: "Welcome back",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setTimeout(async () => {
                await navigate("/onboarding");
            }, 100);
        } catch (err: any) {
            const message = "Please try again later.";

            toast({
                title: "An error occurred.",
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
                        <FormLabel color={colors.font.disabled}>
                            Email address
                        </FormLabel>
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
                            <FormLabel
                                color={useColorModeValue(
                                    "grey.900",
                                    "whites.offwhite",
                                )}
                            >
                                Password
                            </FormLabel>
                            <ShowHidePasswordInput
                                {...register("password", {
                                    required: true,
                                    minLength: 8,
                                    maxLength: 100,
                                })}
                                placeholder="Minimum 8 characters"
                                autoComplete="new-password"
                                color={useColorModeValue(
                                    "black",
                                    "whites.offwhite",
                                )}
                            />
                            {!!errors.password && (
                                <FormErrorMessage>
                                    {errors.password?.message}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                    </VStack>
                    <Button
                        color={useColorModeValue("white", "whites")}
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
                        <Link
                            as={ReachLink}
                            to={"/reset-password" + location.search}
                        >
                            <Text
                                variant="body-sm-semibold"
                                color={useColorModeValue(
                                    "grey.900",
                                    "whites.offwhite",
                                )}
                            >
                                Forgot password?
                            </Text>
                        </Link>
                    </VStack>
                </VStack>
            </chakra.form>
        </VStack>
    );
};
