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
            return (data.messageCount ?? 0) >= 1;
        },
        onComplete: async (data) => {
            console.log("Test completed:", data);
        },
        errorMessage:
            "Pose au moins une question à ton assistant pour continuer",
    },
    {
        id: "improve-assistant",
        title: "Améliore ton assistant en ajoutant tes documents",
        description: "Maintenant, adaptez-le vraiment à ton entreprise",
        icon: FileText,
        component: ImproveAssistantStepComponent,
        validate: (data) => {
            return (data.fileCount ?? 0) >= 1 && (data.messageCount ?? 0) >= 1;
        },
        onComplete: async (data) => {
            console.log("Documents uploaded:", data);
        },
        errorMessage:
            "Ajoute au moins un document et pose une question pour continuer",
    },
    {
        id: "compare-intelligence",
        title: "Compare le style des réponses de ton assistant",
        description: "Compare le style des réponses",
        icon: Zap,
        component: CompareIntelligenceStepComponent,
        validate: (data) => {
            return data.messageSent === true && !!data.selectedLLM;
        },
        onComplete: async (data) => {
            console.log("LLM selected:", data);
        },
        errorMessage:
            "Envoie un message et sélectionne un type de réponse pour continuer",
    },
];
