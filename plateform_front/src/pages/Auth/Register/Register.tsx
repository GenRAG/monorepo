import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link as ReachLink, useLocation, useSearchParams } from "react-router-dom";
import {
    Divider,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Input,
    Link,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { AuthHeader } from "components/Auth/AuthHeader";
import { AuthStepFormProps, RegisterFormSteps } from "pages/Auth/Layout/AuthLayout";

import Button from "components/ui/Button";
import { validateEmail } from "utils/validateEmail";
import GoogleLoginButton from "components/Auth/GoogleLoginButton";
import CreateAccountForm from "./CreateAccountForm";

const RegisterForm: FC<AuthStepFormProps> = ({ onStepChange, currentStep }) => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { colorMode } = useColorMode();

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
    } = useForm({ defaultValues: { email: searchParams.get("email") } });
    const enteredEmail = watch("email");
    const buttonType = useColorModeValue("superSecondary", "superPrimary");
    const labelColor = useColorModeValue("grey.900", "grey.100");

    return (
        <VStack w="100%" gap="32px">
            <VStack>
                <AuthHeader currentStep={currentStep} />
            </VStack>
            <VStack gap="22px" w="100%" align="center" textAlign="center">
                {step === RegisterFormSteps.REGISTER_EMAIL ? (
                    <>
                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel color={labelColor}>Adresse mail</FormLabel>
                            <Input
                                {...register("email", {
                                    validate: (email) => validateEmail(email ?? undefined),
                                })}
                                placeholder="john.smith@gmail.com"
                                autoComplete="email"
                                color={colorMode === "dark" ? "white" : "grey.900"}
                            />
                            {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
                        </FormControl>
                        <VStack w="100%" gap="sm">
                            <Button
                                onClick={() => setStep(RegisterFormSteps.REGISTER_PASSWORD)}
                                h="48px"
                                w="100%"
                                variant={buttonType}
                            >
                                Crée un compte
                            </Button>
                            <HStack wrap="wrap" justify="flex-start" w="100%" gap="0">
                                <Text variant="body-xs" color="grey.300" mr={2}>
                                    Vous avez déjà un compte ?
                                </Text>
                                <Link as={ReachLink} to={{ pathname: "/login", search: location.search }}>
                                    <Text
                                        color={colorMode === "dark" ? "white" : "grey.900"}
                                        variant="body-sm-semibold"
                                    >
                                        Connectez-vous
                                    </Text>
                                </Link>
                            </HStack>
                        </VStack>
                        <>
                            <HStack w="100%">
                                <Divider borderColor="grey.300" />
                                <Text m="auto" variant="body-sm">
                                    ou
                                </Text>
                                <Divider borderColor="grey.300" />
                            </HStack>
                            <VStack w="100%">
                                <GoogleLoginButton />
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
