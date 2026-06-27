import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as ReachLink, useLocation } from "react-router-dom";
import {
    chakra,
    Divider,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Input,
    Link,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { AuthHeader } from "components/Auth/AuthHeader";
import { AuthStepType } from "pages/Auth/Layout/AuthLayout";
import { LocalStorageKeys } from "types/localStorage";
import { useLocalStorage } from "usehooks-ts";
import Button from "components/ui/Button";
import GoogleLoginButton from "components/Auth/GoogleLoginButton";
import { validateEmail } from "utils/validateEmail";

type EmailFormType = {
    email: string;
    rememberEmail: boolean;
};

export const EmailForm: FC<{
    setEmail: (email: string) => void;
    currentStep: AuthStepType;
}> = ({ setEmail, currentStep }) => {
    const location = useLocation();
    const [rememberedEmail, remember, forget] = useLocalStorage(LocalStorageKeys.AUTH.REMEMBERED_EMAIL, "");

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        control,
    } = useForm<EmailFormType>({
        defaultValues: {
            email: rememberedEmail,
            rememberEmail: !!rememberedEmail,
        },
    });
    const textColor = useColorModeValue("grey.900", "grey.100");

    const onSubmit = handleSubmit((data: EmailFormType) => {
        if (data.rememberEmail) remember(data.email);
        else forget();
        setEmail(data.email);
    });


    return (
        <VStack gap="32px" w="100%">
            <VStack>
                <AuthHeader currentStep={currentStep} />
            </VStack>

            <chakra.form w="100%" onSubmit={onSubmit}>
                <VStack align="start" gap="22px">
                    <FormControl isInvalid={!!errors.email}>
                        <FormLabel color={textColor}>Adresse email</FormLabel>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ validate: validateEmail }}
                            render={({ field: { onChange, ...rest } }) => (
                                <Input
                                    onChange={(event) => onChange(event.target.value.trim())}
                                    {...rest}
                                    placeholder="john.smith@example.com"
                                    autoComplete="email"
                                    type="email"
                                    data-cy="cy-email"
                                />
                            )}
                        />
                        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                    </FormControl>

                    <VStack gap="sm" w="100%">
                        <Button
                            variant="superPrimary"
                            w="100%"
                            size="lg"
                            type="submit"
                            isLoading={isSubmitting}
                            data-cy="cy-connect-btn"
                            color={useColorModeValue("white", "whites")}
                        >
                            Connectez-vous
                        </Button>
                        <HStack wrap="wrap" justify="flex-start" w="100%" gap="0">
                            <Text variant="body-xs" color="grey.300" mr={2}>
                                Vous n&apos;avez pas de compte ?
                            </Text>
                            <Link as={ReachLink} to={{ pathname: "/register", search: location.search }}>
                                <Text color={textColor} variant="body-sm-semibold">
                                    Crée un compte
                                </Text>
                            </Link>
                        </HStack>
                    </VStack>
                    <>
                        <HStack w="100%">
                            <Divider borderColor={useColorModeValue("grey.300", "grey.100")} />
                            <Text m="auto" variant="body-sm" color={useColorModeValue("grey.900", "whites.offwhite")}>
                                ou
                            </Text>
                            <Divider borderColor={useColorModeValue("grey.300", "grey.100")} />
                        </HStack>
                        <VStack w="100%">
                            <GoogleLoginButton />
                        </VStack>
                    </>
                </VStack>
            </chakra.form>
        </VStack>
    );
};
