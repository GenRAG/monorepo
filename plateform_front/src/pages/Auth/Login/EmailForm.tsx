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
    Image,
    useColorModeValue,
} from "@chakra-ui/react";
import { AuthHeader } from "pages/Auth/AuthHeader";
import { AuthStepType } from "pages/Auth/Layout/AuthLayout";
import { LocalStorageKeys } from "types/localStorage";
import { useLocalStorage } from "usehooks-ts";

import Button from "components/System/Atoms/Button";
import { validateEmail } from "utils/validateEmail";
import Google from "assets/icons/google.svg";

type EmailFormType = {
    email: string;
    rememberEmail: boolean;
};

export const EmailForm: FC<{
    setEmail: (email: string) => void;
    currentStep: AuthStepType;
}> = ({ setEmail, currentStep }) => {
    const location = useLocation();
    const [rememberedEmail, remember, forget] = useLocalStorage(
        LocalStorageKeys.AUTH.REMEMBERED_EMAIL,
        "",
    );

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
    const textColor = useColorModeValue("grey.900", "white");

    const onSubmit = handleSubmit((data: EmailFormType) => {
        if (data.rememberEmail) remember(data.email);
        else forget();
        setEmail(data.email);
    });

    const buttonType = useColorModeValue("superSecondary", "superPrimary");

    return (
        <VStack gap="32px" w="100%">
            <VStack>
                <AuthHeader currentStep={currentStep} />

                <HStack wrap="wrap" justify="flex-start" w="100%" gap="0">
                    <Text variant="body-sm" color={textColor} mr={2}>
                        You don&apos;t have an account yet ?
                    </Text>
                    <Link
                        as={ReachLink}
                        to={{ pathname: "/register", search: location.search }}
                    >
                        <Text color={textColor} variant="body-sm-semibold">
                            Create an account
                        </Text>
                    </Link>
                </HStack>
            </VStack>

            <chakra.form w="100%" onSubmit={onSubmit}>
                <VStack align="start" gap="32px">
                    <FormControl isInvalid={!!errors.email}>
                        <FormLabel color={textColor}>Email address</FormLabel>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ validate: validateEmail }}
                            render={({ field: { onChange, ...rest } }) => (
                                <Input
                                    onChange={(event) =>
                                        onChange(event.target.value.trim())
                                    }
                                    {...rest}
                                    placeholder="john.smith@example.com"
                                    autoComplete="email"
                                    type="email"
                                    data-cy="cy-email"
                                />
                            )}
                        />
                        <FormErrorMessage>
                            {errors.email?.message}
                        </FormErrorMessage>
                    </FormControl>

                    <VStack gap="sm" w="100%">
                        <Button
                            variant={buttonType}
                            w="100%"
                            size="lg"
                            type="submit"
                            isLoading={isSubmitting}
                            data-cy="cy-connect-btn"
                            color={useColorModeValue("white", "whites")}
                        >
                            Sign in
                        </Button>
                    </VStack>
                    <>
                        <HStack w="100%">
                            <Divider
                                borderColor={useColorModeValue(
                                    "grey.300",
                                    "grey.100",
                                )}
                            />
                            <Text
                                m="auto"
                                variant="body-sm"
                                color={useColorModeValue(
                                    "grey.900",
                                    "whites.offwhite",
                                )}
                            >
                                or
                            </Text>
                            <Divider
                                borderColor={useColorModeValue(
                                    "grey.300",
                                    "grey.100",
                                )}
                            />
                        </HStack>
                        <VStack w="100%">
                            <Button
                                w="100%"
                                bg={useColorModeValue(
                                    "white",
                                    "grey.800 !important",
                                )}
                                border="1px solid"
                                borderColor="grey.200"
                                _hover={{
                                    borderColor: "grey.300",
                                    bg: "grey.50",
                                }}
                                size="lg"
                            >
                                <HStack justify="center" spacing="8px">
                                    <Image src={Google} boxSize="24px" />
                                    <Text
                                        color={useColorModeValue(
                                            "black",
                                            "white",
                                        )}
                                    >
                                        Continue with Google
                                    </Text>
                                </HStack>
                            </Button>
                        </VStack>
                    </>
                </VStack>
            </chakra.form>
        </VStack>
    );
};
