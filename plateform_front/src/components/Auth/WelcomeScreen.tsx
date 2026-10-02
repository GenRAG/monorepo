import { useState, type FormEvent } from "react";
import { Box, DarkMode, FormControl, FormLabel, HStack, Image, Input, Text, VStack } from "@chakra-ui/react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WelcomeStepper } from "./welcome/WelcomeStepper";
import logoGreen from "assets/logo/mainLogo.png";
import Button from "components/ui/Button";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_NAME_MAX_LENGTH } from "types/workspace";

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0, 0, 1] },
    },
};

const GenRAGLogo = () => <Image src={logoGreen} alt="GenRAG" position="absolute" top={5} left={6} h="28px" w="28px" />;

const SuccessBadge = () => (
    <HStack spacing={3} align="center">
        <Box flex={1} h="1px" bg="borderDivider" w="60px" />
        <Text fontSize="10px" fontWeight="600" letterSpacing="0.15em" color="textLabel" textTransform="uppercase">
            Compte créé avec succès
        </Text>
        <Box flex={1} h="1px" bg="borderDivider" w="60px" />
    </HStack>
);

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
            <Box
                position="fixed"
                inset={0}
                zIndex={9999}
                bg="surfaceAppShell"
                sx={{
                    backgroundImage: `
                repeating-linear-gradient(45deg, transparent, transparent 22px, rgba(255,255,255,0.015) 22px, rgba(255,255,255,0.015) 23px),
                repeating-linear-gradient(-45deg, transparent, transparent 22px, rgba(255,255,255,0.015) 22px, rgba(255,255,255,0.015) 23px)
            `,
                }}
            >
                <GenRAGLogo />

                <MotionVStack
                    h="100%"
                    align="center"
                    justify="center"
                    spacing={7}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <MotionBox variants={itemVariants}>
                        <Image src={logoGreen} alt="GenRAG" h="64px" w="64px" />
                    </MotionBox>

                    <MotionBox variants={itemVariants}>
                        <SuccessBadge />
                    </MotionBox>

                    <MotionBox variants={itemVariants} textAlign="center">
                        <Text
                            fontSize="4xl"
                            fontWeight="700"
                            color="textStrong"
                            letterSpacing="-0.03em"
                            lineHeight={1.15}
                        >
                            Bienvenue sur{" "}
                            <Box as="span" color="iconAccent">
                                GenRAG
                            </Box>
                        </Text>
                    </MotionBox>

                    <MotionBox variants={itemVariants}>
                        <Text fontSize="sm" color="textLabel" textAlign="center" maxW="360px" lineHeight={1.7}>
                            Votre compte est prêt. Indiquez le nom de votre entreprise : il s&apos;affichera sur les
                            assistants que vous partagez.
                        </Text>
                    </MotionBox>

                    <MotionBox variants={itemVariants}>
                        <WelcomeStepper />
                    </MotionBox>

                    <MotionVStack as="form" onSubmit={handleSubmit} variants={itemVariants} spacing={4} w="320px">
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
                        <Button w="100%" type="submit" rightIcon={ArrowRight} isLoading={isSubmitting}>
                            Commencer
                        </Button>
                    </MotionVStack>
                </MotionVStack>
            </Box>
        </DarkMode>
    );
};
