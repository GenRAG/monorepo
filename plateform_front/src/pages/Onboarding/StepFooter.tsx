import { HStack, useColorModeValue, VStack } from "@chakra-ui/react";
import Button from "components/System/Atoms/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepFooterProps {
    currentStep: number;
    goNext: () => void;
    goPrevious: () => void;
    onValidateAndGoNext?: () => Promise<void>;
}

const StepFooter = ({
    currentStep,
    goNext,
    goPrevious,
    onValidateAndGoNext,
}: StepFooterProps) => {
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const handleNext = async () => {
        if (onValidateAndGoNext) {
            await onValidateAndGoNext();
        } else {
            goNext();
        }
    };

    return (
        <VStack
            w="100%"
            spacing={3}
            align="stretch"
            pb="24px"
            borderTop="1px solid"
            borderColor={borderColor}
            p={{ base: "8px", md: "12px" }}
        >
            <HStack w="100%" justify="space-between">
                <Button
                    variant="ghost"
                    isDisabled={currentStep === 0}
                    onClick={goPrevious}
                >
                    <ArrowLeft size={18} style={{ marginRight: 8 }} />
                    Retour
                </Button>
                <Button
                    rightIcon={ArrowRight}
                    colorScheme="pink"
                    size="lg"
                    px={8}
                    onClick={handleNext}
                >
                    Sauvegarder et continuer
                </Button>
            </HStack>
        </VStack>
    );
};

export default StepFooter;
