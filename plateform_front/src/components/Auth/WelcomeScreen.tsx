import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WelcomeIcon } from "./welcome/WelcomeIcon";
import { WelcomeStepper } from "./welcome/WelcomeStepper";

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0, 0, 1] } },
};

const DotsGrid = () => (
    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="3px">
        {Array.from({ length: 9 }).map((_, i) => (
            <Box key={i} w="4px" h="4px" borderRadius="1px" bg="green.400" />
        ))}
    </Box>
);

const GenRAGLogo = () => (
    <HStack spacing={2} position="absolute" top={5} left={6}>
        <DotsGrid />
        <Text color="white" fontWeight="semibold" fontSize="md" letterSpacing="-0.01em">
            GenRAG
        </Text>
    </HStack>
);

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
                <WelcomeIcon />
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
                    Votre espace est prêt. Il ne reste plus qu'à le configurer selon vos besoins.
                </Text>
            </MotionBox>

            <MotionBox variants={itemVariants}>
                <WelcomeStepper />
            </MotionBox>

            <MotionVStack variants={itemVariants} spacing={3} align="center">
                <Button
                    onClick={onDone}
                    bg="green.400"
                    color="grey.900"
                    fontWeight="600"
                    px={8}
                    h="48px"
                    borderRadius="full"
                    rightIcon={<ArrowRight size={16} />}
                    _hover={{ bg: "green.300" }}
                    _active={{ bg: "green.500" }}
                >
                    Commencer
                </Button>
                <Text
                    fontSize="sm"
                    color="grey.500"
                    cursor="pointer"
                    onClick={onDone}
                    _hover={{ color: "grey.300" }}
                    transition="color 0.15s"
                >
                    Passer cette étape
                </Text>
            </MotionVStack>
        </MotionVStack>
    </Box>
);
