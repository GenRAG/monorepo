import { forwardRef, useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { nav, site, type SectionId } from "../content";
import { useActivePanel } from "../motion/store";
import { useAnchor } from "../motion/MotionContext";
import { Logo } from "./Logo";
import styles from "./Chrome.module.css";

export const ProgressBar = forwardRef<HTMLDivElement>((_, ref) => (
  <div className={styles.progress} aria-hidden>
    <div ref={ref} className={styles.progressFill} />
  </div>
));
ProgressBar.displayName = "ProgressBar";

const headerLinks = nav.flatMap((item, index) => ("short" in item ? [{ ...item, index }] : []));

export function Header() {
  const anchor = useAnchor();
  const active = useActivePanel();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: SectionId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    anchor(id)(e);
  };

  return (
    <>
      <div className={styles.veil} aria-hidden />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="#accueil" onClick={go("accueil")} className={styles.brand} aria-label="GenRAG, retour en haut">
            <Logo />
          </a>

          <nav className={styles.links} aria-label="Navigation principale">
            {headerLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={go(item.id)}
                className={styles.link}
                aria-current={item.index === active ? "true" : undefined}
              >
                {item.short}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <a href="#contact" onClick={go("contact")} className={styles.headerCta}>
              {site.primaryCta}
              <ArrowRight size={16} aria-hidden />
            </a>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            </button>
          </div>
        </div>

        <nav id="mobile-menu" className={styles.menu} aria-label="Sections" hidden={!open}>
          {headerLinks.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={go(item.id)}
              className={styles.menuLink}
              aria-current={item.index === active ? "true" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
    </>
  );
}

export function SideNav() {
  const active = useActivePanel();
  const anchor = useAnchor();
  return (
    <nav className={styles.sideNav} aria-label="Sections">
      <ol>
        {nav.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={anchor(item.id)}
              className={styles.dot}
              aria-current={i === active ? "true" : undefined}
            >
              <span className={styles.dotLabel}>{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
