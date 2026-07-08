import { Box, DarkMode, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WelcomeStepper } from "./welcome/WelcomeStepper";
import logoGreen from "assets/logo/logoGreen.png";
import Button from "components/ui/Button";

const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionBox = motion(Box);

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0, 0, 1] } },
};

const GenRAGLogo = () => <Image src={logoGreen} alt="GenRAG" position="absolute" top={5} left={6} h="28px" w="28px" />;

const SuccessBadge = () => (
    <HStack spacing={3} align="center">
        <Box flex={1} h="1px" bg="grey.700" w="60px" />
        <Text fontSize="10px" fontWeight="600" letterSpacing="0.15em" color="grey.400" textTransform="uppercase">
            Compte créé avec succès
        </Text>
        <Box flex={1} h="1px" bg="grey.700" w="60px" />
    </HStack>
);

interface WelcomeScreenProps {
    onDone?: () => void;
}

export const WelcomeScreen = ({ onDone }: WelcomeScreenProps) => (
    <DarkMode>
        <Box
            position="fixed"
            inset={0}
            zIndex={9999}
            bg="grey.950"
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
                    <Text fontSize="4xl" fontWeight="700" color="white" letterSpacing="-0.03em" lineHeight={1.15}>
                        Bienvenue sur{" "}
                        <Box as="span" color="green.400">
                            GenRAG
                        </Box>
                    </Text>
                </MotionBox>

                <MotionBox variants={itemVariants}>
                    <Text fontSize="sm" color="grey.400" textAlign="center" maxW="360px" lineHeight={1.7}>
                        Votre espace est prêt. Il ne reste plus qu&apos;à le configurer selon vos besoins.
                    </Text>
                </MotionBox>

                <MotionBox variants={itemVariants}>
                    <WelcomeStepper />
                </MotionBox>

                <MotionHStack gap={8} variants={itemVariants} spacing={3} align="center">
                    <Button w="100%" onClick={onDone} rightIcon={ArrowRight}>
                        Commencer
                    </Button>
                </MotionHStack>
            </MotionVStack>
        </Box>
    </DarkMode>
);
