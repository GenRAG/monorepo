import { providerMask, providers } from "../../components/providerLogos";
import styles from "./ProviderStrip.module.css";

/** Bande défilante des fournisseurs de modèles, sous le hero. */
export function ProviderStrip() {
  // Liste doublée : la bande boucle sans saut en se décalant de la moitié de sa largeur.
  const loop = [...providers, ...providers];
  return (
    <div className={styles.strip}>
      <p className={styles.label}>Les modèles des plus grands fournisseurs, dans un seul éditeur</p>
      <div className={styles.viewport}>
        <ul className={styles.track}>
          {loop.map((provider, i) => (
            <li key={i} className={styles.item} aria-hidden={i >= providers.length || undefined}>
              <span className={styles.logo} style={{ maskImage: providerMask(provider.slug) }} aria-hidden />
              {provider.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
