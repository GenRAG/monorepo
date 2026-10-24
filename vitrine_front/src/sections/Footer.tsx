import { footerNav, pages } from "../routes";
import { Logo } from "../components/Logo";
import styles from "./Footer.module.css";

// TODO: compléter les liens légaux (mentions légales, confidentialité) et l'email de contact.
const legalLinks: { label: string; href: string }[] = [];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
          <p>Des assistants qui connaissent vos documents.</p>
        </div>
        <nav className={styles.columns} aria-label="Plan du site">
          {footerNav.columns.map((column) => (
            <div key={column.title}>
              <p className={styles.columnTitle}>{column.title}</p>
              <ul>
                {column.items.map((id) => {
                  const page = pages[id];
                  return (
                    <li key={id}>
                      <a href={page.path}>{"label" in page ? page.label : id}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className={styles.meta}>
        {legalLinks.length > 0 && (
          <ul>
            {legalLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        )}
        <p>© {new Date().getFullYear()} GenRAG</p>
      </div>
    </footer>
  );
}
