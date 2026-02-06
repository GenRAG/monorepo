import { Sparkles, FileText, Zap, Check } from "lucide-react";
import { StepConfig } from "pages/Onboarding/OnBoardingProvider";
import { TestAssistantStepComponent } from "pages/Onboarding/steps/TestAssistantStep";
import { ImproveAssistantStepComponent } from "pages/Onboarding/steps/ImproveAssistantStep";
import { CompareIntelligenceStepComponent } from "pages/Onboarding/steps/CompareIntelligenceStep";
import { UserPreferencesStepComponent } from "pages/Onboarding/steps/UserPreferencesStep";


export const stepsConfig: StepConfig[] = [
  {
    id: 'test-assistant',
    title: 'Test your HR assistant in 30 seconds',
    description: 'Here\'s your HR assistant ready to use',
    icon: Sparkles,
    component: TestAssistantStepComponent,
    validate: (data) => {
      return !!(data.testQuestion && data.testResponse);
    },
    onComplete: async (data) => {
      console.log('Test completed:', data);
    },
  },
  {
    id: 'improve-assistant',
    title: 'Improve your assistant with your documents',
    description: 'Now, make it truly tailored to your company',
    icon: FileText,
    component: ImproveAssistantStepComponent,
    validate: (data) => {
      return !!(data.documentsUploaded && data.improvedResponse);
    },
    onComplete: async (data) => {
      console.log('Documents uploaded:', data);
    },
  },
  {
    id: 'compare-intelligence',
    title: 'Compare your assistant\'s intelligence',
    description: 'Compare the quality of responses',
    icon: Zap,
    component: CompareIntelligenceStepComponent,
    validate: (data) => {
      return !!data.selectedLLM;
    },
    onComplete: async (data) => {
      console.log('LLM selected:', data);
    },
  },
];