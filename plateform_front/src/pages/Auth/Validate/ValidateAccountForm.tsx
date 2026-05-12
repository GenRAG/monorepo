import { HStack, VStack, PinInput, PinInputField, Button, Text, useColorModeValue } from "@chakra-ui/react";
import useThemedToast from "hooks/useThemedToast";
import { FileWarningIcon, MailIcon, RepeatIcon, TimerIcon } from "lucide-react";
import { AuthHeader } from "pages/Auth/AuthHeader";
import { RegisterFormSteps } from "pages/Auth/Layout/AuthLayout";
import { FC, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResendEmailTokenMutation, useVerifyEmailTokenMutation, useGetMeQuery } from "services/auth/auth";
import colors from "themeNew/foundations/colors";
import { useAuth } from "app/AuthContext";

const ValidateAccountForm: FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login: setLoggedIn } = useAuth();
    const [verifyEmailToken, { isLoading }] = useVerifyEmailTokenMutation();
    const [resendEmailToken, { isLoading: isResending }] = useResendEmailTokenMutation();
    const { refetch: refetchMe } = useGetMeQuery();
    const [pin, setPin] = useState("");
    const toast = useThemedToast();
    const buttonType = useColorModeValue("superSecondary", "superPrimary");
    const pinInputColor = useColorModeValue("whites.offwhite", "black");

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
                            You should have received a verification code via Email
                        </Text>
                    </HStack>

                    <HStack w="100%" gap="8px">
                        <TimerIcon color="white" />
                        <Text variant="body-sm" w="100%" color="whites.offwhite">
                            The code expires in 20 minutes
                        </Text>
                    </HStack>

                    <HStack w="100%" gap="8px">
                        <FileWarningIcon color="white" />
                        <Text variant="body-sm" w="100%" color="whites.offwhite">
                            Can&apos;t find the email? Check your spam or junk folder.
                        </Text>
                    </HStack>

                    <HStack w="100%" gap="8px">
                        <RepeatIcon color="white" />
                        <Text variant="body-sm" w="100%" color="whites.offwhite">
                            Still can&apos;t find it?{" "}
                            <Button
                                isDisabled={isResending}
                                variant="link"
                                color="gold.500"
                                p={0}
                                m={0}
                                onClick={onSubmitResend}
                            >
                                Resend code
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
                            color={pinInputColor}
                        />
                    ))}
                </PinInput>
            </HStack>

            <Button
                onClick={onSubmit}
                disabled={isLoading || pin.length !== 6}
                isLoading={isLoading}
                w="100%"
                variant={buttonType}
            >
                Valider
            </Button>
        </VStack>
    );
};

export default ValidateAccountForm;
