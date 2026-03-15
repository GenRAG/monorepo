import React from 'react';
import { motion } from 'framer-motion';

type FeaturesBentoSectionProps = {
    isDark: boolean;
    accent: string;
    accentDim: string;
    accentBorder: string;
    border: string;
    textPrimary: string;
    textMuted: string;
};

const cardBase = {
    borderRadius: 18,
    border: '1px solid',
    backdropFilter: 'blur(5px)',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
} as const;

type SmallFeatureCardProps = {
    isDark: boolean;
    title: string;
    description: string;
    border: string;
    accentDim: string;
    accentBorder: string;
    textPrimary: string;
    textMuted: string;
    delay: number;
    className?: string;
    children: React.ReactNode;
};

function SmallFeatureCard({
    isDark,
    title,
    description,
    border,
    accentDim,
    accentBorder,
    textPrimary,
    textMuted,
    delay,
    className,
    children,
}: SmallFeatureCardProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.42, delay }}
            whileHover={{
                y: -4,
                boxShadow: isDark
                    ? `0 16px 30px rgba(0,0,0,0.42), 0 0 0 1px ${accentBorder}, 0 0 18px rgba(0,200,150,0.1)`
                    : `0 12px 24px rgba(0,0,0,0.12), 0 0 0 1px ${accentBorder}`,
            }}
            style={{
                ...cardBase,
                minHeight: 220,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: border,
                background: isDark ? 'rgba(16,19,24,0.88)' : 'rgba(255,255,255,0.94)',
                boxShadow: isDark ? '0 8px 22px rgba(0,0,0,0.28)' : '0 8px 18px rgba(0,0,0,0.07)',
            }}
        >
            <div
                style={{
                    flex: 1,
                    minHeight: 118,
                    marginBottom: 16,
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                    borderBottom: `1px solid ${accentBorder}`,
                    background: isDark ? 'rgba(8,12,16,0.88)' : 'rgba(248,250,250,0.98)',
                    backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at top right, ${accentDim} 0%, transparent 55%)`,
                    }}
                />
                {children}
            </div>
            <div style={{ padding: '12px 12px' }}>
                <p style={{ color: textPrimary, fontSize: 20, fontWeight: 700, lineHeight: 1.32, marginBottom: 8 }}>{title}</p>
                <p style={{ color: textMuted, fontSize: 14, lineHeight: 1.62 }}>{description}</p>
            </div>
        </motion.div>
    );
}


const accent = "#00c896";
const accentDim = "rgba(0,200,150,0.12)";
const accentBorder = "rgba(0,200,150,0.35)";
const border = "rgba(75, 71, 71, 0.27)";
const textPrimary = "#000000";
const textMuted = "#7a8a7a";

const accentDark = "#34D3A9";
const accentDimDark = "rgba(52,211,169,0.14)";
const accentBorderDark = "rgba(52,211,169,0.34)";
const borderDark = "rgba(255,255,255,0.06)";
const textPrimaryDark = "#e0e8e0";
const textMutedDark = "#7a8a7a";

const NODES = [
    { id: "query", label: "Query", sub: "Question RH", active: true },
    { id: "retrieve", label: "Retriever", sub: "Top sources", active: false },
    { id: "response", label: "Response", sub: "Cited output", active: false },
];

const NODE_H = 58;
const GAP = 70;
const NODE_W = 140;

function WorkflowPanel(isDark: boolean) {
    const totalH = NODES.length * NODE_H + (NODES.length - 1) * GAP;
    const svgH = totalH;
    const midX = NODE_W / 2;

    return (
        <div style={{
            position: "relative",
            borderRadius: 16,
            background: isDark ? "rgba(8,12,16,0.92)" : "rgba(255,255,255,0.92)",
            overflow: "hidden",
            padding: 0,
            flex: 1,
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
        }}>

            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)'} 1px, transparent 1px)`,
                backgroundSize: "26px 26px",
            }} />

            <div style={{
                position: "absolute", top: 14, left: 14,
                display: "inline-flex", alignItems: "center", gap: 7,
                borderRadius: 999, padding: "6px 11px", fontSize: 11,
                color: isDark ? textPrimaryDark : textPrimary, border: `1px solid ${isDark ? borderDark : border}`,
                background: isDark ? "rgba(15,18,24,0.85)" : "rgba(255,255,255,0.85)", zIndex: 2,
            }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: isDark ? accentDark : accent, boxShadow: `0 0 10px ${isDark ? accentDark :  accent}` }} />
                Minimalist Example
            </div>
            <div style={{
                position: "absolute",
                top: "55%", left: "50%",
                transform: `translate(-50%, -50%)`,
                width: NODE_W,
                height: totalH,
                zIndex: 2,
            }}>
                <svg
                    width={NODE_W}
                    height={svgH}
                    style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
                >
                    {NODES.slice(0, -1).map((_, i) => {
                        const y1 = i * (NODE_H + GAP) + NODE_H;
                        const y2 = (i + 1) * (NODE_H + GAP);
                        const midY = (y1 + y2) / 2;
                        return (
                            <g key={i}>
                                <line
                                    x1={midX} y1={y1}
                                    x2={midX} y2={y2}
                                    stroke={isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"}
                                    strokeWidth={2}
                                />
                                <circle
                                    cx={midX} cy={midY}
                                    r={5}
                                    fill={isDark ? "rgba(8,12,16,0.92)" : "rgba(255,255,255,0.92)"}
                                    stroke={isDark ? accentDark : accent}
                                    strokeWidth={2}
                                    style={{ filter: `drop-shadow(0 0 6px ${isDark ? accentDark : accent})` }}
                                />
                            </g>
                        );
                    })}

                    <motion.circle
                        cx={midX}
                        r={4}
                        fill={isDark ? accentDark : accent}
                        style={{ filter: `drop-shadow(0 0 8px ${isDark ? accentDark : accent})` }}
                        animate={{
                            cy: [NODE_H, totalH - NODE_H],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 0.4,
                        }}
                    />
                </svg>

                {NODES.map((node, i) => (
                    <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.1 + i * 0.1 }}
                        style={{
                            position: "absolute",
                            top: i * (NODE_H + GAP),
                            left: 0,
                            width: NODE_W,
                            height: NODE_H,
                            borderRadius: 12,
                            border: `1px solid ${node.active ? (isDark ? accentBorderDark : accentBorder) : (isDark ? borderDark : border)}`,
                            background: isDark ? "rgba(19,23,29,0.95)" : "rgba(255,255,255,0.95)",
                            padding: "10px 14px",
                            boxSizing: "border-box",
                            boxShadow: node.active ? `0 0 0 1px ${isDark ? accentBorderDark : accentBorder}, 0 0 20px ${isDark ? accentDimDark : accentDim}` : "none",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: 999,
                                background: node.active ? (isDark ? accentDark : accent) : (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)"),
                                boxShadow: node.active ? `0 0 10px ${isDark ? accentDark : accent}` : "none",
                                flexShrink: 0,
                            }} />
                            <span style={{ color: isDark ? textPrimaryDark : textPrimary, fontSize: 13, fontWeight: 700 }}>{node.label}</span>
                        </div>
                        <div style={{ color: isDark ? textMutedDark : textMuted, fontSize: 11, paddingLeft: 16 }}>{node.sub}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}


export function FeaturesBentoSection({
    isDark,
    accent,
    accentDim,
    accentBorder,
    border,
    textPrimary,
    textMuted,
}: FeaturesBentoSectionProps) {
    return (
        <section
            style={{
                position: 'relative',
                padding: '96px 24px 116px',
                borderTop: `1px solid ${border}`,
                background: isDark ? '#0c1016' : '#ffffff',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px)`,
                    backgroundSize: '42px 42px',
                    opacity: isDark ? 0.34 : 0.2,
                    pointerEvents: 'none',
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55 }}
                    style={{ textAlign: 'center', marginBottom: 46 }}
                >
                    <h2
                        style={{
                            color: textPrimary,
                            fontSize: 'clamp(34px, 4.4vw, 52px)',
                            lineHeight: 1.06,
                            letterSpacing: '-0.9px',
                            fontWeight: 800,
                            margin: 0,
                        }}
                    >
                        Powerful AI for HR knowledge
                    </h2>
                    <p
                        style={{
                            color: textMuted,
                            fontSize: 18,
                            marginTop: 16,
                            maxWidth: 680,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            lineHeight: 1.65,
                        }}
                    >
                        GenRAG turns your HR documentation into a reliable AI assistant.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.22 }}
                        transition={{ duration: 0.5, delay: 0.02 }}
                        whileHover={{
                            y: -6,
                            boxShadow: isDark
                                ? `0 22px 46px rgba(0,0,0,0.46), 0 0 0 1px ${accentBorder}, 0 0 28px rgba(0,200,150,0.14)`
                                : `0 16px 34px rgba(0,0,0,0.14), 0 0 0 1px ${accentBorder}`,
                        }}
                        className="md:col-span-2 xl:col-span-2 xl:row-span-2"
                        style={{
                            ...cardBase,
                            minHeight: 510,
                            borderColor: border,
                            background: isDark ? 'rgba(16,19,24,0.9)' : 'rgba(255,255,255,0.95)',
                            boxShadow: isDark ? '0 10px 28px rgba(0,0,0,0.34)' : '0 10px 20px rgba(0,0,0,0.08)',
                        }}
                    >
                        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch" style={{ height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', padding: 24 }}>
                                <div>
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            borderRadius: 999,
                                            border: `1px solid ${accentBorder}`,
                                            background: accentDim,
                                            color: textPrimary,
                                            padding: '7px 12px',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            letterSpacing: '0.04em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        Core product
                                    </div>
                                    <p style={{ color: textPrimary, fontSize: 30, fontWeight: 800, lineHeight: 1.1, marginTop: 18, marginBottom: 12 }}>
                                        Visual RAG Workflow
                                    </p>
                                    <p style={{ color: textMuted, fontSize: 15, lineHeight: 1.72, maxWidth: 420, marginBottom: 18 }}>
                                        Build your HR assistant visually: ingestion, retrieval, reranking and answer generation in one clear flow.
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gap: 10 }}>
                                    {[
                                        'Design the full retrieval pipeline visually',
                                        'Control how documents are searched and ranked',
                                        'Keep every answer grounded in HR sources',
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                color: textPrimary,
                                                fontSize: 14,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: 999,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: accentDim,
                                                    border: `1px solid ${accentBorder}`,
                                                    color: accent,
                                                    flexShrink: 0,
                                                    fontSize: 12,
                                                    fontWeight: 800,
                                                }}
                                            >
                                                ✓
                                            </span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {WorkflowPanel(isDark)}
                        </div>
                    </motion.div>

                    <SmallFeatureCard
                        isDark={isDark}
                        title="HR AI Assistant"
                        description="Instant employee answers with citations from your internal HR documents."
                        className="xl:row-span-2 h-full"
                        border={border}
                        accentDim={accentDim}
                        accentBorder={accentBorder}
                        textPrimary={textPrimary}
                        textMuted={textMuted}
                        delay={0.08}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                inset: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    alignSelf: 'flex-end',
                                    maxWidth: '78%',
                                    borderRadius: 10,
                                    border: `1px solid ${border}`,
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                    color: textPrimary,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    padding: '7px 9px',
                                }}
                            >
                                Combien de jours de congés payés ?
                            </div>

                            <motion.div
                                initial={{ opacity: 0.7, y: 2 }}
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    alignSelf: 'flex-start',
                                    maxWidth: '84%',
                                    borderRadius: 10,
                                    border: `1px solid ${accentBorder}`,
                                    background: accentDim,
                                    color: textPrimary,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    padding: '7px 9px',
                                }}
                            >
                                25 jours ouvrés par an pour un temps plein.
                            </motion.div>

                            <div
                                style={{
                                    alignSelf: 'flex-start',
                                    maxWidth: '84%',
                                    borderRadius: 8,
                                    border: `1px solid ${border}`,
                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.82)',
                                    color: textMuted,
                                    fontSize: 10,
                                    lineHeight: 1.35,
                                    padding: '6px 8px',
                                }}
                            >
                                Source: Règlement intérieur RH · Section 4.2
                            </div>

                            <div
                                style={{
                                    alignSelf: 'flex-end',
                                    maxWidth: '72%',
                                    borderRadius: 10,
                                    border: `1px solid ${border}`,
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                    color: textPrimary,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    padding: '7px 9px',
                                }}
                            >
                                Et pour les RTT ?
                            </div>

                            <div
                                style={{
                                    alignSelf: 'flex-start',
                                    maxWidth: '86%',
                                    borderRadius: 10,
                                    border: `1px solid ${accentBorder}`,
                                    background: accentDim,
                                    color: textPrimary,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    padding: '7px 9px',
                                }}
                            >
                                10 RTT/an selon votre convention collective et votre forfait.
                            </div>

                            <div
                                style={{
                                    alignSelf: 'flex-start',
                                    maxWidth: '86%',
                                    borderRadius: 8,
                                    border: `1px solid ${border}`,
                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.82)',
                                    color: textMuted,
                                    fontSize: 10,
                                    lineHeight: 1.35,
                                    padding: '6px 8px',
                                }}
                            >
                                Source: Accord d&apos;entreprise · Temps de travail
                            </div>

                            <div
                                style={{
                                    alignSelf: 'flex-end',
                                    maxWidth: '72%',
                                    borderRadius: 10,
                                    border: `1px solid ${border}`,
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                    color: textPrimary,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    padding: '7px 9px',
                                }}
                            >
                                Merci
                            </div>

                            <div
                                style={{
                                    alignSelf: 'flex-start',
                                    maxWidth: '86%',
                                    borderRadius: 10,
                                    border: `1px solid ${accentBorder}`,
                                    background: accentDim,
                                    color: textPrimary,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    padding: '7px 9px',
                                }}
                            >
                                Avec plaisir ! N’hésitez pas si vous avez d’autres questions.
                            </div>
                        </div>
                    </SmallFeatureCard>

                    <SmallFeatureCard
                        isDark={isDark}
                        title="Knowledge Base"
                        description="Centralize handbooks, policies, collective agreements and HR procedures."
                        border={border}
                        accentDim={accentDim}
                        accentBorder={accentBorder}
                        textPrimary={textPrimary}
                        textMuted={textMuted}
                        delay={0.12}
                    >
                        {[0, 1, 2].map((item) => (
                            <div
                                key={item}
                                style={{
                                    position: 'absolute',
                                    left: 26 + item * 18,
                                    top: 20 - item * 2,
                                    width: 64,
                                    height: 78,
                                    borderRadius: 12,
                                    border: `1px solid ${accentBorder}`,
                                    background: isDark ? `rgba(0,200,150,${0.06 + item * 0.03})` : `rgba(0,168,118,${0.08 + item * 0.04})`,
                                }}
                            />
                        ))}
                        <div style={{ position: 'absolute', left: 26, bottom: 18, right: 26, height: 10, borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                    </SmallFeatureCard>

                    <SmallFeatureCard
                        isDark={isDark}
                        title="Smart Retrieval"
                        description="Relevant HR content is found first, even across long and dense documents."
                        border={border}
                        accentDim={accentDim}
                        accentBorder={accentBorder}
                        textPrimary={textPrimary}
                        textMuted={textMuted}
                        delay={0.2}
                    >
                        <div style={{ position: 'absolute', left: 18, top: 26, width: 82, height: 48, borderRadius: 10, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)' }} />
                        <motion.div
                            animate={{ x: [0, 7, 0], y: [0, -2, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'absolute', right: 26, top: 28, width: 28, height: 28, borderRadius: 999, border: `2px solid ${accent}`, boxShadow: `0 0 0 5px ${accentDim}` }}
                        >
                            <div style={{ position: 'absolute', right: -6, bottom: -3, width: 12, height: 2, background: accent, transform: 'rotate(40deg)', borderRadius: 2 }} />
                        </motion.div>
                    </SmallFeatureCard>

                    <SmallFeatureCard
                        isDark={isDark}
                        title="Auto updates"
                        description="As soon as HR documents change, the assistant stays aligned with the latest version."
                        border={border}
                        accentDim={accentDim}
                        accentBorder={accentBorder}
                        textPrimary={textPrimary}
                        textMuted={textMuted}
                        delay={0.24}
                    >
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 4.4, repeat: Infinity, ease: 'linear' }}
                                style={{ width: 34, height: 34, borderRadius: 999, border: `2px solid ${accentBorder}`, borderTopColor: accent }}
                            />
                        </div>
                    </SmallFeatureCard>
                </div>
            </div>
        </section>
    );
}
