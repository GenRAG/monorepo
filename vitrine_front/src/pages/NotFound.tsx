import { ArrowRight } from "lucide-react";
import { Layout } from "../components/Layout";
import { Panel } from "../components/Panel";
import { ButtonLink, SectionIntro } from "../components/ui";
import { pages } from "../routes";

export function NotFoundPage() {
  return (
    <Layout page="accueil">
      <Panel id="introuvable" label="Page introuvable" tone="open" full>
        <SectionIntro
          numbered={false}
          as="h1"
          eyebrow="404"
          title="Cette page n'existe pas."
          text="Le lien est peut-être ancien. Repartez de l'accueil."
        >
          <div>
            <ButtonLink href={pages.accueil.path}>
              Retour à l'accueil
              <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          </div>
        </SectionIntro>
      </Panel>
    </Layout>
  );
}
