import { Search, X, Pencil, Sparkles, Info, MessageSquareText, Database } from "lucide-react";
import { builder } from "../../content";
import { BLOCK_ORDER, type BuilderDemoState } from "./useBuilderDemo";
import styles from "./NodePalette.module.css";

const icons = { rewrite: Pencil, rank: Sparkles, answer: MessageSquareText, search: Database, question: Search };

type Item = { id: keyof typeof icons; description: string };

const matches = (id: Item["id"], query: string) =>
  !query || builder.nodes[id].toLowerCase().startsWith(query.toLowerCase());

/** Palette « Chercher des blocs » de l'app (MenuNodeModal). */
export function NodePalette({ state }: { state: BuilderDemoState }) {
  const { palette, blocks, hover } = state;
  const t = builder.palette;

  const available: Item[] = BLOCK_ORDER.filter((id) => !blocks[id]).map((id) => ({
    id,
    description: builder.blocks[id].description,
  }));
  const used: Item[] = [
    ...BLOCK_ORDER.filter((id) => blocks[id]).map((id) => ({ id, description: builder.blocks[id].description })),
    ...(t.usedBlocks as Item[]),
  ];
  const shownAvailable = available.filter((item) => matches(item.id, palette.query));
  const highlighted = hover?.startsWith("palette-") ? hover.slice(8) : palette.query ? shownAvailable[0]?.id : null;

  return (
    <div className={`${styles.backdrop} ${palette.open ? styles.open : ""}`} aria-hidden>
      <div className={styles.palette}>
        <div className={styles.searchRow}>
          <Search size={15} className={styles.searchIcon} />
          <span data-demo="palette-search" className={`${styles.search} ${palette.focused ? styles.focused : ""}`}>
            {palette.query ? (
              <span className={styles.query}>{palette.query}</span>
            ) : (
              <span className={styles.placeholder}>{t.search}</span>
            )}
            {palette.focused && <span className={styles.caret} />}
          </span>
          <X size={15} className={styles.close} />
        </div>

        <div className={styles.list}>
          <p className={styles.group}>{t.available}</p>
          {available.map((item) => (
            <Row key={item.id} item={item} hidden={!shownAvailable.includes(item)} active={highlighted === item.id} />
          ))}
          <div className={styles.divider} />
          <p className={styles.group}>{t.used}</p>
          {used.map((item) => (
            <Row key={item.id} item={item} used hidden={!matches(item.id, palette.query)} />
          ))}
        </div>

        <div className={styles.hints}>
          {t.hints.map((hint) => (
            <span key={hint.label} className={styles.hint}>
              {hint.keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
              {hint.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ item, used, hidden, active }: { item: Item; used?: boolean; hidden?: boolean; active?: boolean }) {
  const Icon = icons[item.id];
  return (
    <div
      data-demo={used ? undefined : `palette-${item.id}`}
      className={`${styles.row} ${used ? styles.used : ""} ${hidden ? styles.rowHidden : ""} ${active ? styles.active : ""}`}
    >
      <span className={styles.rowIcon}>
        <Icon size={14} />
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>
          {builder.nodes[item.id]}
          {used && <span className={styles.usedTag}>{builder.palette.usedTag}</span>}
        </span>
        <span className={styles.rowDesc}>{item.description}</span>
      </span>
      {!used && <Info size={13} className={styles.info} />}
    </div>
  );
}
