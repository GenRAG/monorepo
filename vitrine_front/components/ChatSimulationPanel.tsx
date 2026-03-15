"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type ChatItem = {
  user: string;
  assistant: string;
  source: string;
};

const chatSequence: ChatItem[] = [
  {
    user: "Quelles sont les r\u00e8gles sur les jours de t\u00e9l\u00e9travail ?",
    assistant: "La convention Syntec autorise jusqu\u2019\u00e0 2 jours de t\u00e9l\u00e9travail par semaine accord\u00e9s apr\u00e8s 6 mois d\u2019anciennet\u00e9.",
    source: "Convention Syntec \u2013 Avenant T\u00e9l\u00e9travail, Art. 3",
  },
  {
    user: "Combien de jours de cong\u00e9s pay\u00e9s ai-je droit ?",
    assistant: "Tout salari\u00e9 a droit \u00e0 25 jours ouvrables de cong\u00e9s pay\u00e9s par an, soit 5 semaines.",
    source: "Guide RH Collaborateur \u2013 Page 12",
  },
];

type Stage = "user" | "typing" | "assistant" | "sources";

interface ChatSimulationPanelProps {
  isDark: boolean;
  accent: string;
  accentDim: string;
  accentBorder: string;
  border: string;
  surfaceAlt: string;
  textPrimary: string;
  textMuted: string;
}

export function ChatSimulationPanel({
  isDark,
  accent,
  accentDim,
  accentBorder,
  border,
  surfaceAlt,
  textPrimary,
  textMuted,
}: ChatSimulationPanelProps) {
  const [activeTurn, setActiveTurn] = useState(0);
  const [stage, setStage] = useState<Stage>("user");

  useEffect(() => {
    let cancelled = false;
    const timeoutIds: number[] = [];
    const lastTurnIndex = chatSequence.length - 1;

    const runTurn = (turn: number) => {
      setActiveTurn(turn);
      setStage("user");

      timeoutIds.push(window.setTimeout(() => !cancelled && setStage("typing"), 700));
      timeoutIds.push(window.setTimeout(() => !cancelled && setStage("assistant"), 1500));
      timeoutIds.push(window.setTimeout(() => !cancelled && setStage("sources"), 2200));

      timeoutIds.push(window.setTimeout(() => {
        if (cancelled) return;

        if (turn < lastTurnIndex) {
          runTurn(turn + 1);
          return;
        }

        timeoutIds.push(window.setTimeout(() => {
          if (cancelled) return;
          runTurn(0);
        }, 1200));
      }, 3200));
    };

    runTurn(0);

    return () => {
      cancelled = true;
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, []);
  const visibleTurns = chatSequence.slice(0, activeTurn + 1);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: isDark ? "rgba(8,12,16,0.72)" : "rgba(255,255,255,0.82)",
        boxShadow: isDark
          ? "0 10px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.02)"
          : "0 8px 24px rgba(0,0,0,0.10)",
        border: `1px solid ${border}`,
        backdropFilter: "blur(6px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Sortie du pipeline
        </span>
        <span style={{ color: textMuted, fontSize: 11 }}>Simulation en direct</span>
      </div>

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9, flex: 1, overflow: "hidden" }}>
        {visibleTurns.map((turn, turnIndex) => {
          const isCurrentTurn = turnIndex === activeTurn;
          const showTyping = isCurrentTurn && stage === "typing";
          const showAssistant = !isCurrentTurn || stage === "assistant" || stage === "sources";
          const showSources = !isCurrentTurn || stage === "sources";

          return (
            <div key={`turn-${turnIndex}`} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <motion.div
                initial={isCurrentTurn ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  maxWidth: "78%",
                  alignSelf: "flex-end",
                  padding: "9px 10px",
                  borderRadius: "10px 10px 4px 10px",
                  border: `1px solid ${accentBorder}`,
                  background: accentDim,
                  color: textPrimary,
                  fontSize: 12,
                  lineHeight: 1.45,
                  fontWeight: 500,
                }}
              >
                {turn.user}
              </motion.div>

              {showTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    alignSelf: "flex-start",
                    border: `1px solid ${border}`,
                    background: surfaceAlt,
                    borderRadius: "10px 10px 10px 4px",
                    padding: "8px 10px",
                    display: "flex",
                    gap: 5,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.35, 1, 0.35] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      style={{ width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block" }}
                    />
                  ))}
                </motion.div>
              )}

              {showAssistant && (
                <motion.div
                  initial={isCurrentTurn ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    maxWidth: "86%",
                    alignSelf: "flex-start",
                    padding: "9px 10px",
                    borderRadius: "10px 10px 10px 4px",
                    border: `1px solid ${border}`,
                    background: surfaceAlt,
                    color: textPrimary,
                    fontSize: 12,
                    lineHeight: 1.45,
                    fontWeight: 500,
                  }}
                >
                  {turn.assistant}
                </motion.div>
              )}

              {showSources && (
                <motion.div
                  initial={isCurrentTurn ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 1 }}
                >
                  <span style={{ fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Source
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: accent,
                      background: accentDim,
                      border: `1px solid ${accentBorder}`,
                      borderRadius: 999,
                      padding: "4px 8px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "74%",
                    }}
                  >
                    {turn.source}
                  </span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
