import { HStack, Image, Text, Button as ChakraButton } from "@chakra-ui/react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useGoogleLoginMutation, useGetMeQuery } from "services/auth/auth";
import mixpanel from "lib/mixpanel";
import { useAuth } from "app/AuthContext";
import useThemedToast from "hooks/useThemedToast";
import Google from "assets/icons/google.svg";

const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const toast = useThemedToast();
    const { login: setLoggedIn } = useAuth();
    const { refetch: refetchMe } = useGetMeQuery();
    const [googleLogin, { isLoading }] = useGoogleLoginMutation();

    const handleClick = useGoogleLogin({
        onSuccess: async ({ access_token }) => {
            try {
                await googleLogin({ credential: access_token }).unwrap();
                const meResult = await refetchMe();
                if (meResult.data) {
                    mixpanel.identify(meResult.data.id);
                    mixpanel.people.set({ $name: meResult.data.name, $email: meResult.data.email });
                }
                mixpanel.track("user_logged_in", { method: "google" });
                setLoggedIn();
                void navigate("/");
            } catch {
                toast({ title: "Erreur lors de la connexion Google", status: "error", duration: 4000 });
            }
        },
        onError: () => toast({ title: "Erreur lors de la connexion Google", status: "error", duration: 4000 }),
    });

    return (
        <ChakraButton
            w="100%"
            size="lg"
            bg="white"
            _hover={{ transform: "scale(1.02)", boxShadow: "md" }}
            _active={{ bg: "grey.25" }}
            variant="none"
            onClick={() => handleClick()}
            isLoading={isLoading}
        >
            <HStack justify="center" spacing="8px">
                <Image src={Google} boxSize="24px" />
                <Text size="sm" color="black">
                    Continuer avec Google
                </Text>
            </HStack>
        </ChakraButton>
    );
};

export default GoogleLoginButton;
