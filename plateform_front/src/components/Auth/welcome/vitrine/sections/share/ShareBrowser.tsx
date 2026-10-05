import type { CSSProperties, Ref } from "react";
import { ArrowUp, Check, FileText, Loader2, Lock, RotateCw, Rocket } from "lucide-react";
import { share } from "../../content";
import { DemoCursor } from "../../components/DemoCursor";
import { AssistantLogo } from "../../components/Logo";
import type { ShareDemoState } from "./useShareDemo";
import styles from "./ShareBrowser.module.css";

const cls = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

interface ShareBrowserProps {
    ref: Ref<HTMLDivElement>;
    state: ShareDemoState;
    color: number;
    style: CSSProperties;
}

/** Fenêtre de navigateur : écran de déploiement de GenRAG, puis l'assistant en ligne sur son sous-domaine. */
export function ShareBrowser({ ref, state, color, style }: ShareBrowserProps) {
    const live = state.phase === "live";
    const typingUrl = state.url.length > 0 && state.url.length < share.url.length;

    return (
        <div
            ref={ref}
            className={styles.browser}
            style={style}
            role="img"
            aria-label={`Démonstration : on choisit l'adresse ${share.url} et une couleur, on déploie, et l'assistant est aussitôt en ligne à cette adresse.`}
        >
            <div className={styles.chrome} aria-hidden>
                <span className={styles.lights}>
                    <i />
                    <i />
                    <i />
                </span>
                <div className={cls(styles.url, typingUrl && styles.urlEditing)}>
                    <Lock size={12} />
                    <span>
                        {state.url || share.setup.url}
                        {typingUrl && <span className={styles.caret} />}
                    </span>
                </div>
                <RotateCw size={13} className={styles.reload} />
            </div>

            <div className={cls(styles.screens, state.fading && styles.fading)} aria-hidden>
                <DeployScreen state={state} color={color} hidden={live} />
                <ChatScreen state={state} hidden={!live} />
            </div>

            <DemoCursor cursor={state.cursor} />
        </div>
    );
}

function DeployScreen({ state, color, hidden }: { state: ShareDemoState; color: number; hidden: boolean }) {
    const t = share.setup;
    const deploying = state.phase !== "setup";
    return (
        <div className={cls(styles.screen, styles.deploy, hidden && styles.screenOut)}>
            <div className={styles.deployHead}>
                <span className={styles.deployIcon}>
                    <AssistantLogo size={22} />
                </span>
                <div>
                    <p className={styles.deployTitle}>{t.title}</p>
                    <p className={styles.deploySub}>{t.subtitle}</p>
                </div>
            </div>

            <p className={styles.label}>{t.address}</p>
            <div
                data-demo="subdomain"
                className={cls(styles.field, state.focused === "subdomain" && styles.fieldFocus)}
            >
                <span className={styles.sub}>
                    {state.subdomain}
                    {state.focused === "subdomain" && <span className={styles.caret} />}
                </span>
                <span className={styles.domain}>{share.domain}</span>
            </div>

            <p className={styles.label}>{t.color}</p>
            <div className={styles.colors}>
                {share.colors.map((c, i) => (
                    <span
                        key={c.value}
                        data-demo={`swatch-${i}`}
                        className={cls(styles.color, i === color && styles.colorOn)}
                        style={{ "--c": c.value } as CSSProperties}
                    />
                ))}
            </div>

            <span
                data-demo="deploy"
                className={cls(
                    styles.deployBtn,
                    state.hover === "deploy" && styles.btnHover,
                    deploying && styles.btnBusy,
                )}
            >
                {deploying ? (
                    state.deployed < t.steps.length ? (
                        <>
                            <Loader2 size={14} className={styles.spin} /> {t.deploying}
                        </>
                    ) : (
                        <>
                            <Check size={14} strokeWidth={3} /> {share.url}
                        </>
                    )
                ) : (
                    <>
                        <Rocket size={14} /> {t.deploy}
                    </>
                )}
            </span>

            <ul className={cls(styles.steps, deploying && styles.stepsOn)}>
                {t.steps.map((s, i) => (
                    <li key={s} className={i < state.deployed ? styles.stepDone : undefined}>
                        <span className={styles.tick}>
                            <Check size={10} strokeWidth={3.5} />
                        </span>
                        {s}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ChatScreen({ state, hidden }: { state: ShareDemoState; hidden: boolean }) {
    const words = share.answer.split(" ");
    return (
        <div className={cls(styles.screen, styles.chat, hidden && styles.screenOut)}>
            <header className={styles.appHead}>
                <span className={styles.brandMark}>{share.company[0]}</span>
                <div>
                    <p className={styles.appName}>{share.company}</p>
                    <p className={styles.appSub}>{share.assistantName}</p>
                </div>
                <span className={styles.online}>{share.online}</span>
            </header>
            <div className={styles.thread}>
                <p className={styles.welcome}>{share.welcome}</p>
                {state.sent && <p className={styles.user}>{share.question}</p>}
                {state.answer > 0 && (
                    <div className={styles.bot}>
                        <p>{words.slice(0, state.answer).join(" ")}</p>
                        {state.source && (
                            <span className={styles.source}>
                                <FileText size={11} />
                                {share.source}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className={cls(styles.input, state.focused === "question" && styles.inputFocus)}>
                <span data-demo="question" className={state.question ? styles.typed : undefined}>
                    {state.question || share.inputPlaceholder}
                    {state.focused === "question" && <span className={styles.caret} />}
                </span>
                <span data-demo="send" className={cls(styles.send, state.hover === "send" && styles.btnHover)}>
                    <ArrowUp size={14} />
                </span>
            </div>
        </div>
    );
}
