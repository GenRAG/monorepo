import type { CSSProperties } from "react";
import { FileText, Sparkles, User } from "lucide-react";
import { builder } from "../../content";
import type { BlockId } from "./useBuilderDemo";
import styles from "./BlockOverview.module.css";

const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** Mini-animation de l'onglet « Aperçu » d'un bloc, pilotée par l'étape en cours. */
export function BlockOverview({ block, chapter }: { block: BlockId; chapter: number }) {
    const def = builder.blocks[block];
    return (
        <div className={styles.overview}>
            <p className={styles.heading}>{def.heading}</p>
            <div className={styles.stage}>
                <span className={styles.chip} key={chapter}>
                    <Sparkles size={11} />
                    {def.steps[chapter]}
                </span>
                {block === "rewrite" ? <RewriteScene chapter={chapter} /> : <RankScene chapter={chapter} />}
                <div className={styles.progress}>
                    {def.steps.map((s, i) => (
                        <i key={s} className={i <= chapter ? styles.done : undefined} />
                    ))}
                </div>
            </div>
            <ol className={styles.steps} data-demo="panel-steps">
                {def.steps.map((s, i) => (
                    <li key={s} className={i === chapter ? styles.current : undefined}>
                        <span className={styles.dot} />
                        {i + 1}. {s}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function RewriteScene({ chapter }: { chapter: number }) {
    const def = builder.blocks.rewrite;
    const rewritten = chapter >= 1;
    return (
        <div className={styles.scene}>
            <div className={`${styles.card} ${rewritten ? styles.cardActive : ""}`}>
                <p className={styles.cardLabel}>
                    {rewritten ? <Sparkles size={10} /> : <User size={10} />}
                    {rewritten ? "Question optimisée" : "Question originale"}
                </p>
                {rewritten ? (
                    <p className={styles.text} key="new">
                        {def.rewritten.split(" ").map((w, i) => (
                            <span key={i} className={styles.word} style={vars({ "--i": i })}>
                                {w}{" "}
                            </span>
                        ))}
                    </p>
                ) : (
                    <p className={styles.text} key="old">
                        {def.original.split(" ").map((w, i) => (
                            <span key={i} className={w === def.vague ? styles.vague : undefined}>
                                {w}{" "}
                            </span>
                        ))}
                    </p>
                )}
                <p className={styles.tags}>
                    <span>{def.tags.intent}</span>
                    <span className={rewritten ? styles.tagStrong : undefined}>
                        {rewritten ? def.tags.high : def.tags.low}
                    </span>
                </p>
            </div>
            <div className={`${styles.scores} ${chapter >= 2 ? styles.scoresOn : ""}`}>
                {[
                    [def.scores.beforeLabel, def.scores.before, false],
                    [def.scores.afterLabel, def.scores.after, true],
                ].map(([label, value, strong]) => (
                    <p key={String(label)} className={strong ? styles.scoreStrong : undefined}>
                        <span>{label}</span>
                        <span className={styles.bar}>
                            <i style={vars({ "--w": `${value}%` })} />
                        </span>
                        <span>{value}%</span>
                    </p>
                ))}
            </div>
        </div>
    );
}

function RankScene({ chapter }: { chapter: number }) {
    const { results, dropped } = builder.blocks.rank;
    const sorted = [...results].sort((a, b) => b.score - a.score);
    return (
        <ul className={`${styles.results} ${chapter === 0 ? styles.scoring : ""}`}>
            {results.map((r, i) => {
                const rank = chapter >= 1 ? sorted.indexOf(r) : i;
                const isDropped = chapter >= 2 && rank === results.length - 1;
                const isTop = chapter >= 2 && rank === 0;
                return (
                    <li
                        key={r.name}
                        className={`${isDropped ? styles.dropped : ""} ${isTop ? styles.top : ""}`}
                        style={vars({
                            "--row": rank,
                            "--i": i,
                            "--sim": `${r.sim * 100}%`,
                            "--score": `${r.score * 100}%`,
                        })}
                    >
                        <span className={styles.rank}>{rank + 1}</span>
                        <FileText size={11} className={styles.fileIcon} />
                        <span className={styles.name}>{r.name}</span>
                        {isDropped ? (
                            <span className={styles.droppedTag}>{dropped}</span>
                        ) : (
                            <>
                                <span className={styles.bar}>
                                    <i />
                                </span>
                                <span className={styles.value}>
                                    <span className={styles.sim}>{r.sim.toFixed(2)}</span>
                                    <span className={styles.score}>{r.score.toFixed(2)}</span>
                                </span>
                            </>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
