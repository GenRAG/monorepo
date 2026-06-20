import { HStack, useColorModeValue, VStack } from "@chakra-ui/react";
import Button from "components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepFooterProps {
    currentStep: number;
    goNext: () => void;
    goPrevious: () => void;
    onValidateAndGoNext?: () => Promise<void>;
    onSkip?: () => void;
}

const StepFooter = ({ currentStep, goNext, goPrevious, onValidateAndGoNext, onSkip }: StepFooterProps) => {
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const skipHoverColor = useColorModeValue("grey.600", "grey.300");

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
                <Button variant="ghost" isDisabled={currentStep === 0} onClick={goPrevious}>
                    <ArrowLeft size={18} style={{ marginRight: 8 }} />
                    Retour
                </Button>
                <HStack spacing={4}>
                    {onSkip && (
                        <Button variant="outline" size="lg" _hover={{ color: skipHoverColor }} onClick={onSkip}>
                            Passer le tutoriel
                        </Button>
                    )}
                    <Button rightIcon={ArrowRight} colorScheme="pink" size="lg" px={8} onClick={handleNext}>
                        Sauvegarder et continuer
                    </Button>
                </HStack>
            </HStack>
        </VStack>
    );
};

export default StepFooter;
