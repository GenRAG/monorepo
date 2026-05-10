import { LucideIcon, Sparkles, FileText, Zap } from "lucide-react";
import { StepConfig } from "pages/Onboarding/OnBoardingProvider";
import { TestAssistantStepComponent } from "pages/Onboarding/steps/TestAssistantStep";
import { ImproveAssistantStepComponent } from "pages/Onboarding/steps/ImproveAssistantStep";
import { CompareIntelligenceStepComponent } from "pages/Onboarding/steps/CompareIntelligenceStep";

export const stepsConfig: StepConfig[] = [
    {
        id: "test-assistant",
        title: "Essaye ton assistant RH en 30 secondes",
        description: "Voici ton assistant RH prêt à être utilisé",
        icon: Sparkles as LucideIcon,
        component: TestAssistantStepComponent,
        validate: (data) => Number(data.messageCount ?? 0) >= 1,
        errorMessage:
            "Pose au moins une question à ton assistant pour continuer",
    },
    {
        id: "improve-assistant",
        title: "Améliore ton assistant en ajoutant tes documents",
        description: "Maintenant, adapte-le vraiment à ton entreprise",
        icon: FileText as LucideIcon,
        component: ImproveAssistantStepComponent,
        validate: (data) =>
            Number(data.fileCount ?? 0) >= 1 &&
            Number(data.messageCount ?? 0) >= 1,
        errorMessage:
            "Ajoute au moins un document et pose une question pour continuer",
    },
    {
        id: "compare-intelligence",
        title: "Compare le style des réponses de ton assistant",
        description: "Compare le style des réponses",
        icon: Zap as LucideIcon,
        component: CompareIntelligenceStepComponent,
        validate: (data) => data.messageSent === true && !!data.selectedLLM,
        errorMessage:
            "Envoie un message et sélectionne un type de réponse pour continuer",
    },
];
