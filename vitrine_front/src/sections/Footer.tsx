import { footer } from "../content";
import { Logo } from "../components/Logo";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
          <p>{footer.tagline}</p>
        </div>
        <div className={styles.meta}>
          {footer.links.length > 0 && (
            <ul>
              {footer.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          )}
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
