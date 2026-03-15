import { HStack, Text, VStack } from "@chakra-ui/react";
import Button from "components/Atoms/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepFooterProps {
    currentStep: number;
    goNext: () => void;
    goPrevious: () => void;
    onValidateAndGoNext?: () => Promise<void>;
    showReassuringMessage?: boolean;
}

const StepFooter = ({
    currentStep,
    goNext,
    goPrevious,
    onValidateAndGoNext,
    showReassuringMessage,
}: StepFooterProps) => {
    const handleNext = async () => {
        if (onValidateAndGoNext) {
            await onValidateAndGoNext();
        } else {
            goNext();
        }
    };

    return (
        <VStack w="100%" spacing={3} align="stretch" pb="24px">
            {showReassuringMessage && (
                <Text
                    fontSize="xs"
                    color="grey.500"
                    textAlign="center"
                    fontStyle="italic"
                >
                    Vous pouvez continuer avec votre configuration actuelle et
                    ajouter d&apos;autres sources ultérieurement.
                </Text>
            )}
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
                    Sauvegarder and continuer
                </Button>
            </HStack>
        </VStack>
    );
};

export default StepFooter;
