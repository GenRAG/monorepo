import { Layout } from "../components/Layout";
import { CtaBand } from "../components/CtaBand";
import { PageHero } from "../components/PageHero";
import { ChatArt } from "../illustrations/ChatArt";
import { IndexArt } from "../illustrations/IndexArt";
import { ShareArt } from "../illustrations/ShareArt";
import { Assistants } from "../sections/Assistants";
import { Builder } from "../sections/Builder";
import { Connectors } from "../sections/Connectors";
import { Models } from "../sections/Models";
import { Reasoning } from "../sections/Reasoning";
import { Share } from "../sections/Share";
import { Analytics } from "../sections/Analytics";

export function CreatePage() {
  return (
    <Layout page="creer">
      <PageHero
        eyebrow="Produit"
        title="Un assistant à votre image, en quelques clics."
        text="Choisissez un modèle prêt à l'emploi ou réglez chaque étape dans GenRAG Studio, l'éditeur visuel."
        art={<ChatArt />}
      />
      <Assistants />
      <Builder />
      <Models />
      <CtaBand />
    </Layout>
  );
}

export function DocumentsPage() {
  return (
    <Layout page="documents">
      <PageHero
        eyebrow="Produit"
        title="Vos documents deviennent des réponses."
        text="Importez vos fichiers, reliez votre Drive, et laissez l'assistant chercher à votre place."
        art={<IndexArt />}
      />
      <Connectors />
      <Reasoning />
      <CtaBand />
    </Layout>
  );
}

export function DeployPage() {
  return (
    <Layout page="deployer">
      <PageHero
        eyebrow="Produit"
        title="Partagez-le, puis voyez ce que votre équipe demande."
        text="Un lien suffit pour publier votre assistant. Les statistiques vous montrent ce qui manque."
        art={<ShareArt />}
      />
      <Share />
      <Analytics />
      <CtaBand />
    </Layout>
  );
}
