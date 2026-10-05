import { HStack } from "@chakra-ui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "components/ui/Button";

interface StepFooterProps {
    currentStep: number;
    totalSteps: number;
    goNext: () => void;
    goPrevious: () => void;
}

const StepFooter = ({ currentStep, totalSteps, goNext, goPrevious }: StepFooterProps) => (
    <HStack
        w="100%"
        px={4}
        py={3}
        flexShrink={0}
        justify="space-between"
        bg="surfaceCard"
        borderTopWidth="1px"
        borderTopStyle="solid"
        borderColor="borderSubtle"
    >
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} isDisabled={currentStep === 0} onClick={goPrevious}>
            Retour
        </Button>
        <Button rightIcon={ArrowRight} px={6} onClick={goNext}>
            {currentStep === totalSteps - 1 ? "Terminer" : "Continuer"}
        </Button>
    </HStack>
);

export default StepFooter;
