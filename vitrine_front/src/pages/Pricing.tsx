import { Layout } from "../components/Layout";
import { CtaBand } from "../components/CtaBand";
import { PageHero } from "../components/PageHero";
import { UsageArt } from "../illustrations/UsageArt";
import { Plans } from "./pricing/Plans";
import { CostExamples } from "./pricing/CostExamples";
import { Estimator } from "./pricing/Estimator";
import { Faq } from "./pricing/Faq";

export function PricingPage() {
  return (
    <Layout page="tarifs">
      <PageHero
        eyebrow="Tarifs"
        title="Vous payez ce que vos assistants utilisent."
        text="Chaque réponse consomme des crédits, selon les modèles utilisés et la complexité de l'architecture de votre assistant. Un modèle haut de gamme ou une architecture plus élaborée coûte plus qu'un assistant simple sur un modèle rapide."
        art={<UsageArt />}
      />
      <Plans />
      <CostExamples />
      <Estimator />
      <Faq />
      <CtaBand pricingLink={false} />
    </Layout>
  );
}
