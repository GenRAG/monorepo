import { OnboardingContext } from "pages/Onboarding/OnBoardingProvider";
import { useContext } from "react";


export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};