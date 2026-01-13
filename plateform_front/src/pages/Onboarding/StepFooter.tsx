import { HStack, Text, VStack } from "@chakra-ui/react";
import Button from "components/Atoms/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const StepFooter: React.FC<{
  currentStep: number;
  goNext: () => void;
  goPrevious: () => void;
  onValidateAndGoNext?: () => Promise<void>;
  showReassuringMessage?: boolean;
}> = ({ currentStep, goNext, goPrevious, onValidateAndGoNext, showReassuringMessage }) => {
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
        <Text fontSize="xs" color="grey.500" textAlign="center" fontStyle="italic">
          You can continue with your current setup and add more sources later
        </Text>
      )}
      <HStack w="100%" justify="space-between">
        <Button variant="ghost" isDisabled={currentStep === 0} onClick={goPrevious}>
          <ArrowLeft size={18} style={{ marginRight: 8 }} />
          Back
        </Button>
        <Button rightIcon={ArrowRight} colorScheme="pink" size="lg" px={8} onClick={handleNext}>
          Save and continue
        </Button>
      </HStack>
    </VStack>
  )
}

export default StepFooter;