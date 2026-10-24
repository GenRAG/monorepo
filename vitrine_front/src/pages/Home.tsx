import { Layout } from "../components/Layout";
import { CtaBand } from "../components/CtaBand";
import { CaseList } from "../sections/CaseList";
import { Hero } from "../sections/Hero";
import { Platform } from "../sections/Platform";
import { Problem } from "../sections/Problem";
import { Steps } from "../sections/Steps";
import { Why } from "../sections/Why";

export function HomePage() {
  return (
    <Layout page="accueil">
      <Hero />
      <Problem />
      <Platform />
      <Steps />
      <CaseList />
      <Why />
      <CtaBand />
    </Layout>
  );
}
