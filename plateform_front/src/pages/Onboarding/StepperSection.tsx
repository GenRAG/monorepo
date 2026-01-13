import { Box, HStack, Icon, Step, StepDescription, StepIndicator, Stepper, StepSeparator, StepStatus, StepTitle, Text, useSteps, VStack } from "@chakra-ui/react";
import { Check, Info, Mail, Send, Tag } from "lucide-react";

const StepperSection = () => {

  const { activeStep } = useSteps({
    index: 1,
    count: 4,
  });

  const steps = [
    {
      title: 'Add Workspace',
      description: 'Add your support email address to start sending and receiving messages from customers.',
      icon: Check
    },
    {
      title: 'Verification & Setting',
      description: 'Verify your support email address to confirm that it is properly linked to your domain. This ensures that outgoing emails are correctly authenticated and reach your customers.',
      icon: Mail
    },
    {
      title: 'Sending Emails',
      description: 'Use your verified support email to respond to customer inquiries. Ensure each email is sent with a clear and professional tone, representing your company\'s brand and values.',
      icon: Send
    },
    {
      title: 'Create Issue',
      description: 'Easily track and manage customer issues right from your email.',
      icon: Tag
    },
  ];

  return (
    <VStack
      w="400px"
      bg="linear-gradient(135deg, #ebf4ffaf 0%, #ffe8faff 100%)"
      borderRadius="24px"
      p={8}
      align="stretch"
      spacing={6}
    >
      <HStack
        bg="white"
        p={4}
        borderRadius="12px"
        spacing={3}
        align="start"
      >
        <Icon as={Info} color="blue.500" mt={0.5} boxSize={4} />
        <Text fontSize="sm" color="grey.700">
          Get started by setting up your workspace and company email.
        </Text>
      </HStack>
      <Stepper h="100%" index={activeStep} orientation="vertical" gap={0} colorScheme="pink" w="100%">
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator flexShrink={0} bg={"white"} border={"none"}>
              <StepStatus
                complete={<Icon as={Check} color="white" boxSize={4} />}
                incomplete={<Icon as={step.icon} color="grey.500" boxSize={4} />}
                active={<Icon as={step.icon} color="pink.500" boxSize={4} />}
              />
            </StepIndicator>
            <Box flex={1} ml={4} minW={0}>
              <StepTitle>
                <Text fontWeight="semibold" color="grey.900" fontSize="md">
                  {step.title}
                </Text>
              </StepTitle>
              <StepDescription>
                <Text fontSize="sm" color="grey.600" mt={1}>
                  {step.description}
                </Text>
              </StepDescription>
            </Box>
            <StepSeparator
              style={{
                backgroundColor: 'transparent',
                borderLeft: index >= activeStep ? '2px dashed #D1D5DB' : '2px solid #EC4899',
              }}
            />
          </Step>
        ))}
      </Stepper>
    </VStack>
  )
}

export default StepperSection;