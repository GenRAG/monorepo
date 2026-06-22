import { HStack, VStack, PinInput, PinInputField, Text } from "@chakra-ui/react";
import useThemedToast from "hooks/useThemedToast";
import { FileWarningIcon, MailIcon, RepeatIcon, TimerIcon } from "lucide-react";
import { AuthHeader } from "components/Auth/AuthHeader";
import { RegisterFormSteps } from "pages/Auth/Layout/AuthLayout";
import { FC, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResendEmailTokenMutation, useVerifyEmailTokenMutation, useGetMeQuery } from "services/auth/auth";
import colors from "themeNew/foundations/colors";
import { useAuth } from "app/AuthContext";
import Button from "components/ui/Button";

const ValidateAccountForm: FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login: setLoggedIn } = useAuth();
    const [verifyEmailToken, { isLoading }] = useVerifyEmailTokenMutation();
    const [resendEmailToken, { isLoading: isResending }] = useResendEmailTokenMutation();
    const { refetch: refetchMe } = useGetMeQuery();
    const [pin, setPin] = useState("");
    const toast = useThemedToast();

    const email = searchParams.get("email");

    const onSubmit = async () => {
        if (!email || pin.length !== 6) return;
        verifyEmailToken({ email, token: Number(pin) })
            .unwrap()
            .then(async () => {
                await refetchMe();
                setLoggedIn();
                void navigate("/");
            })
            .catch((error) => {
                toast({
                    status: "error",
                    title: "Verification failed",
                    description: error?.data?.error?.message || "Failed to verify email. Please try again.",
                    isClosable: true,
                });
            });
    };

    const onSubmitResend = async () => {
        if (!email) return;
        resendEmailToken({ email })
            .unwrap()
            .then(() => {
                toast({
                    status: "success",
                    title: "Verification email resent!",
                    description: "A new verification code has been sent to your email.",
                });
            })
            .catch((error) => {
                toast({
                    status: "error",
                    title: "Resend failed",
                    description: error.data.error.message || "Failed to resend verification email. Please try again.",
                    isClosable: true,
                });
            });
    };

    return (
        <VStack w="100%" align="start" gap="32px">
            <VStack gap="16px">
                <AuthHeader currentStep={RegisterFormSteps.REGISTER_VALIDATE} />
                <VStack w="100%" gap="8px">
                    <HStack w="100%" gap="8px">
                        <MailIcon color="white" />
                        <Text variant="body-sm" w="100%" color="whites.offwhite">
                            Vous devriez avoir reçu un code de vérification par email
                        </Text>
                    </HStack>

                    <HStack w="100%" gap="8px">
                        <TimerIcon color="white" />
                        <Text variant="body-sm" w="100%" color="whites.offwhite">
                            Le code expire dans 20 minutes
                        </Text>
                    </HStack>

                    <HStack w="100%" gap="8px">
                        <FileWarningIcon color="white" />
                        <Text variant="body-sm" w="100%" color="whites.offwhite">
                            Impossible de trouver l&apos;email? Vérifiez votre dossier de spam ou de courrier
                            indésirable.
                        </Text>
                    </HStack>

                    <HStack w="100%" gap="8px">
                        <RepeatIcon color="white" />
                        <Text variant="body-sm" w="100%" color="whites.offwhite">
                            Vous ne recevez pas le code?{" "}
                            <Button
                                isDisabled={isResending}
                                variant="link"
                                color="gold.500"
                                p={0}
                                m={0}
                                onClick={onSubmitResend}
                            >
                                Renvoyer le code
                            </Button>
                        </Text>
                    </HStack>
                </VStack>
            </VStack>

            <HStack w="100%" justify="space-between">
                <PinInput otp onChange={setPin} focusBorderColor={colors.gold[500]} placeholder="0">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <PinInputField
                            key={index}
                            flex="1"
                            textAlign="center"
                            borderWidth="2px"
                            color="grey.900"
                            bg="green.400"
                        />
                    ))}
                </PinInput>
            </HStack>

            <Button
                onClick={onSubmit}
                disabled={isLoading || pin.length !== 6}
                isLoading={isLoading}
                w="100%"
                variant="superPrimary"
            >
                Valider
            </Button>
        </VStack>
    );
};

export default ValidateAccountForm;
