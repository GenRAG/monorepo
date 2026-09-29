import { LayoutGrid, MessageCircle, FileText, Workflow, BarChart3, Cloud, Settings, ChevronsLeft } from "lucide-react";
import { builder } from "../content";
import styles from "./AppSidebar.module.css";

const icons: Record<string, typeof LayoutGrid> = {
  "Test & chat": MessageCircle,
  Documents: FileText,
  Architecture: Workflow,
  Analytics: BarChart3,
  Déploiement: Cloud,
};

/** Sidebar agent de l'app (AgentSidebar), en version maquette. */
export function AppSidebar({ active }: { active: string }) {
  const { agent, groups } = builder.sidebar;
  return (
    <aside className={`${styles.sidebar}`} aria-hidden>
      <div className={styles.head}>
        <span className={styles.avatar}>{agent[0]}</span>
        <span className={styles.agent}>{agent}</span>
        <span className={styles.collapse}>
          <ChevronsLeft size={12} />
        </span>
      </div>
      <p className={`${styles.group} ${styles.compactHide}`}>Menu</p>
      <span className={`${styles.item} ${styles.compactHide}`}>
        <LayoutGrid size={14} /> Retour au menu
      </span>
      {groups.map((g) => (
        <div key={g.label}>
          <p className={styles.group}>{g.label}</p>
          {g.items.map((item) => {
            const Icon = icons[item];
            return (
              <span key={item} className={`${styles.item} ${item === active ? styles.active : ""}`}>
                <Icon size={14} /> {item}
              </span>
            );
          })}
        </div>
      ))}
      <p className={`${styles.group} ${styles.compactHide}`}>Général</p>
      <span className={`${styles.item} ${styles.compactHide}`}>
        <Settings size={14} /> Paramètres
      </span>
    </aside>
  );
}
