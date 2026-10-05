import { useState, type FormEvent } from "react";
import {
    Box,
    DarkMode,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Icon,
    Image,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react";
import { motion, MotionConfig } from "framer-motion";
import { Check } from "lucide-react";
import logoGreen from "assets/logo/mainLogo.png";
import Button from "components/ui/Button";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_NAME_MAX_LENGTH } from "types/workspace";
import { WelcomeStage } from "./welcome/WelcomeStage";
import { WELCOME_EASE, WELCOME_NEXT_STEPS } from "./welcome/welcomeContent";

const MotionVStack = motion(VStack);

interface WelcomeScreenProps {
    onDone?: (organizationName: string) => void;
    isSubmitting?: boolean;
}

export const WelcomeScreen = ({ onDone, isSubmitting }: WelcomeScreenProps) => {
    const [organizationName, setOrganizationName] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onDone?.(organizationName);
    };

    return (
        <DarkMode>
            <MotionConfig reducedMotion="user">
                <Flex position="fixed" inset={0} zIndex={9999} bg="grey.975" overflow="auto">
                    <Image src={logoGreen} alt="GenRAG" position="absolute" top="24px" left="24px" h="36px" />

                    <WelcomeStage />

                    <Flex
                        as="main"
                        flexShrink={0}
                        w={{ base: "100%", lg: "clamp(400px, 34vw, 520px)" }}
                        direction="column"
                        justify="center"
                        px={{ base: 6, lg: 12 }}
                        py={24}
                        borderLeftWidth={{ base: 0, lg: "1px" }}
                        borderLeftStyle="solid"
                        borderColor="borderDefault"
                    >
                        <MotionVStack
                            align="stretch"
                            spacing={8}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: WELCOME_EASE }}
                        >
                            <VStack align="start" spacing={4}>
                                <HStack spacing={2} color="iconAccent">
                                    <Icon as={Check} boxSize={4} strokeWidth={3} />
                                    <Text variant="body-sm-semibold">Compte créé</Text>
                                </HStack>
                                <Heading
                                    as="h1"
                                    fontSize={{ base: "32px", lg: "40px" }}
                                    fontWeight={600}
                                    lineHeight={1.05}
                                    letterSpacing="-0.03em"
                                    color="textStrong"
                                >
                                    Bienvenue sur GenRAG
                                </Heading>
                                <Text variant="body-md" color="textLabel" lineHeight={1.6}>
                                    Indiquez le nom de votre entreprise : il s&apos;affiche sur les assistants que vous
                                    partagez.
                                </Text>
                            </VStack>

                            <VStack as="form" onSubmit={handleSubmit} align="stretch" spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs" color="textLabel">
                                        Nom de votre entreprise
                                    </FormLabel>
                                    <Input
                                        value={organizationName}
                                        onChange={(e) => setOrganizationName(e.target.value)}
                                        placeholder={DEFAULT_WORKSPACE_NAME}
                                        maxLength={WORKSPACE_NAME_MAX_LENGTH}
                                        autoFocus
                                    />
                                </FormControl>
                                <Button w="100%" type="submit" isLoading={isSubmitting}>
                                    Commencer
                                </Button>
                            </VStack>

                            <Divider borderColor="borderDefault" />

                            <Box>
                                <Text variant="body-sm" color="textLabel" mb={3}>
                                    Ensuite, trois étapes pour créer votre premier assistant :
                                </Text>
                                <VStack as="ol" align="stretch" spacing={2.5} listStyleType="none">
                                    {WELCOME_NEXT_STEPS.map((step, i) => (
                                        <HStack as="li" key={step} spacing={3}>
                                            <Flex
                                                w="22px"
                                                h="22px"
                                                align="center"
                                                justify="center"
                                                flexShrink={0}
                                                borderRadius="full"
                                                borderWidth="1px"
                                                borderStyle="solid"
                                                borderColor="borderStrong"
                                            >
                                                <Text variant="body-xs" color="textLabel">
                                                    {i + 1}
                                                </Text>
                                            </Flex>
                                            <Text variant="body-sm" color="textPrimary">
                                                {step}
                                            </Text>
                                        </HStack>
                                    ))}
                                </VStack>
                            </Box>
                        </MotionVStack>
                    </Flex>
                </Flex>
            </MotionConfig>
        </DarkMode>
    );
};
