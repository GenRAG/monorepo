import { Sparkles, FileText, Zap } from "lucide-react";
import { StepConfig } from "pages/Onboarding/OnBoardingProvider";
import { TestAssistantStepComponent } from "pages/Onboarding/steps/TestAssistantStep";
import { ImproveAssistantStepComponent } from "pages/Onboarding/steps/ImproveAssistantStep";
import { CompareIntelligenceStepComponent } from "pages/Onboarding/steps/CompareIntelligenceStep";


export const stepsConfig: StepConfig[] = [
    {
        id: "test-assistant",
        title: "Essaye ton assistant RH en 30 secondes",
        description: "Voici ton assistant RG prêt à être utilisé",
        icon: Sparkles,
        component: TestAssistantStepComponent,
        validate: (data) => {
            return !!(data.testQuestion && data.testResponse);
        },
        onComplete: async (data) => {
            console.log("Test completed:", data);
        },
    },
    {
        id: "improve-assistant",
        title: "Améliore ton assistant en ajoutant tes documents",
        description: "Maintenant, adaptez-le vraiment à ton entreprise",
        icon: FileText,
        component: ImproveAssistantStepComponent,
        validate: (data) => {
            return !!(data.documentsUploaded && data.improvedResponse);
        },
        onComplete: async (data) => {
            console.log("Documents uploaded:", data);
        },
    },
    {
        id: "compare-intelligence",
        title: "Compare l'intelligence de ton assistant",
        description: "Compare la qualité des réponses",
        icon: Zap,
        component: CompareIntelligenceStepComponent,
        validate: (data) => {
            return !!data.selectedLLM;
        },
        onComplete: async (data) => {
            console.log("LLM selected:", data);
        },
    },
];
