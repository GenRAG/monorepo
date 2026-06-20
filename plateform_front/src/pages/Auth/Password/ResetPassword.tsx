import { FC } from "react";
import { useForm } from "react-hook-form";
import { Link as ReachLink } from "react-router-dom";
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
} from "@chakra-ui/react";

import { Button } from "@chakra-ui/react";
import useThemedToast from "hooks/useThemedToast";
import { validateEmail } from "utils/validateEmail";
import { useResetPasswordMutation } from "services/auth/auth";

type ResetPasswordFormType = {
    email: string;
};

const ResetPasswordForm: FC = () => {
    const toast = useThemedToast();
    const [resetPasswordQuery, { isLoading }] = useResetPasswordMutation();
    const buttonType = useColorModeValue("superSecondary", "superPrimary");
    const labelColor = useColorModeValue("grey.900", "whites.offwhite");
    const fieldTextColor = useColorModeValue("black", "whites.offwhite");

    const {
        formState: { errors },
        register,
        handleSubmit,
    } = useForm<ResetPasswordFormType>({
        reValidateMode: "onSubmit",
    });

    const onSubmit = handleSubmit(({ email }: ResetPasswordFormType) => {
        resetPasswordQuery({ email })
            .unwrap()
            .then(() => {
                toast({
                    status: "success",
                    title: "Un email de réinitialisation a été envoyé !",
                    description: "Veuillez vérifier votre boîte de réception pour réinitialiser votre mot de passe.",
                    duration: 4000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                if ("status" in error) {
                    toast({
                        title: "Une erreur est survenue.",
                        description: error.data.error.message || "Veuillez réessayer plus tard.",
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
                Reset your password
            </Heading>

            <chakra.form w="100%" onSubmit={onSubmit}>
                <VStack gap={6}>
                    <FormControl isInvalid={!!errors.email}>
                        <FormLabel color={labelColor}>Adresse mail du compte perdu</FormLabel>
                        <Input
                            {...register("email", { validate: validateEmail })}
                            placeholder="john.smith@gmail.com"
                            autoComplete="email"
                            color={fieldTextColor}
                        />
                        {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
                    </FormControl>

                    <Button variant={buttonType} size="lg" w="100%" isLoading={isLoading} type="submit">
                        Reset your password
                    </Button>

                    <Flex justify="space-between">
                        <Link as={ReachLink} to={"/login"}>
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
