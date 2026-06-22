import { Box, HStack, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";

const StepDone = ({ label }: { label: string }) => (
    <HStack spacing={2}>
        <Box
            w="24px"
            h="24px"
            borderRadius="full"
            bg="green.400"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
        >
            <Check size={12} color="#0a0a0a" strokeWidth={3} />
        </Box>
        <Text fontSize="sm" color="green.400" fontWeight="500">
            {label}
        </Text>
    </HStack>
);

const StepCurrent = ({ num, label }: { num: number; label: string }) => (
    <HStack spacing={2}>
        <Box
            w="24px"
            h="24px"
            borderRadius="full"
            borderWidth="2px"
            borderStyle="solid"
            borderColor="green.400"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
        >
            <Text fontSize="11px" fontWeight="700" color="green.400" lineHeight={1}>
                {num}
            </Text>
        </Box>
        <Text fontSize="sm" color="white" fontWeight="500">
            {label}
        </Text>
    </HStack>
);

const StepFuture = ({ num, label }: { num: number; label: string }) => (
    <HStack spacing={2}>
        <Box
            w="24px"
            h="24px"
            borderRadius="full"
            borderWidth="2px"
            borderStyle="solid"
            borderColor="grey.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
        >
            <Text fontSize="11px" fontWeight="700" color="grey.500" lineHeight={1}>
                {num}
            </Text>
        </Box>
        <Text fontSize="sm" color="grey.500">
            {label}
        </Text>
    </HStack>
);

const Connector = () => <Box w="40px" h="1px" bg="grey.700" flexShrink={0} />;

export const WelcomeStepper = () => (
    <HStack spacing={2} align="center">
        <StepDone label="Inscription" />
        <Connector />
        <StepCurrent num={2} label="Bienvenue" />
        <Connector />
        <StepFuture num={3} label="Configuration" />
    </HStack>
);
