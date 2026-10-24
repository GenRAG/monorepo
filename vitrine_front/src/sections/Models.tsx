import { Check } from "lucide-react";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { providerMask, providers } from "../components/providerLogos";
import styles from "./Models.module.css";

export function Models() {
  return (
    <Panel id="modeles" label="Modèles IA" tone="open">
      <div className={styles.layout}>
        <SectionIntro
          eyebrow="Modèles IA"
          title="Les modèles les plus récents du marché, au choix."
          text="Choisissez le modèle de chaque bloc parmi les grands fournisseurs. Un nouveau modèle sort ? Il arrive dans votre sélecteur, sans rien reconfigurer."
        >
          <p className={styles.stat} {...reveal(3)}>
            <strong>400+</strong>
            modèles disponibles, des plus grands fournisseurs
          </p>
          <ul className={styles.points} {...reveal(4)}>
            {["Un modèle par bloc", "Comparez qualité, vitesse et prix", "Changez de modèle en un clic"].map(
              (point) => (
                <li key={point}>
                  <Check size={14} strokeWidth={3} aria-hidden /> {point}
                </li>
              ),
            )}
          </ul>
        </SectionIntro>

        <ul className={styles.grid}>
          {providers.map((provider, i) => (
            <li key={provider.slug} className={styles.tile} {...reveal(2 + i / 2)}>
              {/* Logo en masque : il prend la couleur du texte, en clair comme en sombre. */}
              <span className={styles.logo} style={{ maskImage: providerMask(provider.slug) }} aria-hidden />
              <span className={styles.name}>{provider.name}</span>
            </li>
          ))}
          <li className={`${styles.tile} ${styles.more}`} {...reveal(7)}>
            Et des centaines d'autres
          </li>
        </ul>
      </div>
    </Panel>
  );
}
