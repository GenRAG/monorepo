import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { pages, type PageId } from "../routes";
import { pageIcons } from "./pageIcons";
import styles from "./NavMenu.module.css";

// Laisse le temps de passer du bouton au panneau sans que le menu se ferme.
const CLOSE_DELAY_MS = 140;

interface NavMenuProps {
  label: string;
  items: PageId[];
  current: PageId;
}

/** Menu déroulant de la barre du haut : s'ouvre au survol ou au clic, se ferme avec Échap. */
export function NavMenu({ label, items, current }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>(undefined);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector("button")?.focus();
    };
    const onPointer = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  return (
    <div
      ref={root}
      className={styles.root}
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        data-current={items.includes(current) || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <ChevronDown size={14} aria-hidden className={styles.chevron} />
      </button>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <div className={styles.card}>
          <p className={styles.title}>{label}</p>
          <ul className={styles.list}>
            {items.map((id) => {
              const page = pages[id];
              const { icon: Icon, tone } = pageIcons[id];
              return (
                <li key={id}>
                  <a href={page.path} className={styles.item} aria-current={id === current ? "page" : undefined}>
                    <span className={`${styles.icon} ${styles[tone]}`}>
                      <Icon size={13} strokeWidth={2.25} aria-hidden />
                    </span>
                    {"label" in page ? page.label : id}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
