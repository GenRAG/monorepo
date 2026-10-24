import { forwardRef, useEffect, useState } from "react";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { menu, pages, type PageId } from "../routes";
import { useActivePanel } from "../motion/store";
import { useAnchor } from "../motion/MotionContext";
import { currentScheme, setScheme, type Scheme } from "../theme";
import { Logo } from "./Logo";
import { NavMenu } from "./NavMenu";
import styles from "./Chrome.module.css";

export const ProgressBar = forwardRef<HTMLDivElement>((_, ref) => (
  <div className={styles.progress} aria-hidden>
    <div ref={ref} className={styles.progressFill} />
  </div>
));
ProgressBar.displayName = "ProgressBar";

const labelOf = (id: PageId) => {
  const page = pages[id];
  return "label" in page ? page.label : id;
};

function ThemeToggle() {
  const [scheme, setLocal] = useState<Scheme>(currentScheme);
  const next: Scheme = scheme === "dark" ? "light" : "dark";
  const label = next === "light" ? "Passer en mode clair" : "Passer en mode sombre";
  return (
    <button
      type="button"
      className={styles.iconButton}
      aria-label={label}
      title={label}
      onClick={() => {
        setScheme(next);
        setLocal(next);
      }}
    >
      {scheme === "dark" ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
    </button>
  );
}

export function Header({ current }: { current: PageId }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href={pages.accueil.path} className={styles.brand} aria-label="GenRAG, accueil">
          <Logo />
        </a>

        <nav className={styles.links} aria-label="Navigation principale">
          {menu.map((entry) =>
            "items" in entry ? (
              <NavMenu key={entry.label} label={entry.label} items={entry.items} current={current} />
            ) : (
              <a
                key={entry.label}
                href={pages[entry.page].path}
                className={styles.link}
                aria-current={entry.page === current ? "page" : undefined}
              >
                {entry.label}
              </a>
            ),
          )}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <a href={pages.contact.path} className={styles.headerCta}>
            Demander un accès
          </a>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      <nav id="mobile-menu" className={styles.menu} aria-label="Pages" hidden={!open}>
        {menu.map((entry) => (
          <div key={entry.label} className={styles.menuGroup}>
            {"items" in entry && <p className={styles.menuTitle}>{entry.label}</p>}
            {("items" in entry ? entry.items : [entry.page]).map((id) => (
              <a
                key={id}
                href={pages[id].path}
                className={styles.menuLink}
                aria-current={id === current ? "page" : undefined}
              >
                {labelOf(id)}
              </a>
            ))}
          </div>
        ))}
        <a href={pages.contact.path} className={`${styles.headerCta} ${styles.menuCta}`}>
          Demander un accès
          <ArrowRight size={16} aria-hidden />
        </a>
      </nav>
    </header>
  );
}

export interface PanelLink {
  id: string;
  label: string;
}

/** Points de navigation entre les sections de la page courante. */
export function SideNav({ panels }: { panels: PanelLink[] }) {
  const active = useActivePanel();
  const anchor = useAnchor();
  if (panels.length < 3) return null;
  return (
    <nav className={styles.sideNav} aria-label="Sections de la page">
      <ol>
        {panels.map((panel) => (
          <li key={panel.id}>
            <a
              href={`#${panel.id}`}
              onClick={anchor(panel.id)}
              className={styles.dot}
              aria-current={panel.id === active ? "true" : undefined}
            >
              <span className={styles.dotLabel}>{panel.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
