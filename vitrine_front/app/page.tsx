"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ChatSimulationPanel } from '../components/ChatSimulationPanel';
import { FeaturesBentoSection } from '../components/FeaturesBentoSection';
import { ModelCompatibilityStrip } from '../components/ModelCompatibilityStrip';
import { SiteFooter } from '../components/SiteFooter';
import { Icon } from '@chakra-ui/react';
import { ArrowDown, Moon, Sun } from 'lucide-react';

const WorkflowPackagePreview = dynamic(
  () => import('../components/WorkflowPackagePreview').then((m) => m.WorkflowPackagePreview),
  { ssr: false },
);

const easing = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing, delay } },
});

const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easing } },
};

const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easing } },
};

export default function GenRAGDesign() {
  const [activeNav, setActiveNav] = useState('Home');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const navItems = ['Accueil', 'Guides', 'Astuces'];

  const hrQuestions = [
    'Quels sont mes droits en matière de congés payés ?',
    'Combien de jours de télétravail sont autorisés ?',
    'Que dit la convention Syntec sur les heures supplémentaires ?',
    'Quel est le préavis en cas de démission ?',
  ];

  const steps = [
    {
      title: 'Importez vos documents RH',
      desc: 'Conventions, règlements intérieurs, contrats, guides collaborateurs.',
      icon: 'doc',
    },
    {
      title: 'GenRAG crée votre base de connaissance',
      desc: 'Recherche sémantique, découpage intelligent, pipeline RAG clé en main.',
      icon: 'pipeline',
    },
    {
      title: 'Vos équipes obtiennent des réponses instantanées',
      desc: 'Réponses IA ancrées dans vos vrais documents, avec citations précises.',
      icon: 'chat',
    },
  ];

  const dark = {
    accent: '#00c896',
    accentDim: 'rgba(0,200,150,0.15)',
    accentBorder: 'rgba(0,200,150,0.35)',
    bg: '#0b0e11',
    surface: '#111418',
    surfaceAlt: '#161b22',
    border: 'rgba(255,255,255,0.07)',
    textPrimary: '#f0f0f0',
    textMuted: '#6b7280',
    textDim: '#9ca3af',
    thumbGrad1: 'linear-gradient(135deg, #1a1f26 0%, #232b35 100%)',
    thumbGrad2: 'linear-gradient(135deg, #161b22 0%, #1e242d 100%)',
  };

  const light = {
    accent: '#00a876',
    accentDim: 'rgba(0,168,118,0.10)',
    accentBorder: 'rgba(0,168,118,0.30)',
    bg: '#e8e8e8',
    surface: '#f5f5f3',
    surfaceAlt: '#ffffff',
    border: 'rgba(0,0,0,0.08)',
    textPrimary: '#1a1a1a',
    textMuted: '#888888',
    textDim: '#555555',
    thumbGrad1: 'linear-gradient(135deg, #d0d0d0 0%, #e0e0e0 100%)',
    thumbGrad2: 'linear-gradient(135deg, #c4c4c4 0%, #d4d4d4 100%)',
  };

  const th = isDark ? dark : light;
  const { accent, accentDim, accentBorder, bg, surface, surfaceAlt, border,
    textPrimary, textMuted, textDim } = th;

  return (
    <div
      className="min-h-screen"
      style={{ background: bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}
    >
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="relative overflow-hidden w-full min-h-screen lg:h-screen lg:grid lg:grid-cols-2"
          style={{
            background: bg,
            transition: 'background 0.3s',
          }}
        >

          <motion.div
            className="relative flex flex-col"
            variants={slideLeft}
            initial="hidden"
            animate="visible"
            style={{
              padding: '24px 20px 28px', background: surface,
              borderRight: `1px solid ${border}`,
              transition: 'background 0.3s, border-color 0.3s',
            }}
          >
            <motion.div
              className="mb-8 flex flex-wrap items-center justify-between gap-4 md:mb-10 md:flex-nowrap"
              variants={fadeUp(0.1)}
              initial="hidden"
              animate="visible"
            >
              <div className='flex items-center gap-3'>
                <div className="grid grid-cols-3 gap-1" style={{ width: 22, height: 22 }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: 1, background: accent }} />
                  ))}
                </div>
                <p className='mt-1 text-2xl font-bold md:text-3xl' style={{ color: accent }}>GenRAG</p>
              </div>

              <div className="order-3 flex w-full items-center justify-center gap-4 md:order-none md:w-auto md:justify-start md:gap-5">
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveNav(item)}
                    className="flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: activeNav === item ? textPrimary : textMuted, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {activeNav === item
                      ? <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block', marginRight: 2 }} />
                      : <span style={{ width: 5, height: 5, borderRadius: '50%', border: `1.5px solid ${textMuted}`, display: 'inline-block', marginRight: 2 }} />
                    }
                    {item}
                  </button>
                ))}
              </div>

              <motion.button
                onClick={() => setIsDark(!isDark)}
                whileTap={{ scale: 0.92 }}
                style={{
                  width: 44, height: 24, borderRadius: 999,
                  background: isDark ? accent : '#d1d5db',
                  border: 'none', cursor: 'pointer',
                  position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                }}
                title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  style={{
                    position: 'absolute', top: 3,
                    left: isDark ? 'calc(100% - 21px)' : '3px',
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                  }}
                >
                  {isDark ? <Icon as={Moon} color="black" /> : <Icon as={Sun} color="black" />}
                </motion.span>
              </motion.button>
            </motion.div>

            <div style={{ lineHeight: 1.02, marginBottom: '16px' }} className="mt-4 md:mt-8 lg:mt-10">
              <motion.div
                variants={fadeUp(0.45)}
                initial="hidden"
                animate="visible"
                style={{ fontSize: 'clamp(52px, 11vw, 120px)', fontWeight: 900, color: textPrimary, letterSpacing: '-2px', fontFamily: "'DM Sans', sans-serif" }}
              >
                Transformez
              </motion.div>

              <motion.div
                variants={fadeUp(0.6)}
                initial="hidden"
                animate="visible"
                style={{ fontSize: 'clamp(44px, 9vw, 100px)', fontWeight: 900, color: textPrimary, letterSpacing: '-2px', fontFamily: "'DM Sans', sans-serif" }}
              >
                vos documents
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-2 md:gap-3"
                variants={fadeUp(0.75)}
                initial="hidden"
                animate="visible"
                style={{ marginTop: '4px' }}
              >
                <span style={{ fontSize: 'clamp(32px, 5.2vw, 58px)', fontWeight: 900, color: textPrimary, letterSpacing: '-2px', fontFamily: "'DM Sans', sans-serif" }}>
                  en
                </span>
                <motion.span
                  whileHover={{ scale: 1.04, boxShadow: `0 0 20px ${accentBorder}` }}
                  style={{
                    fontSize: 'clamp(32px, 5.2vw, 58px)', fontWeight: 900, color: accent,
                    letterSpacing: '-2px', fontFamily: "'DM Sans', sans-serif",
                    border: `2px solid ${accentBorder}`, borderRadius: '10px',
                    padding: '8px 10px', lineHeight: 1.1, display: 'inline-block',
                    background: accentDim, cursor: 'default',
                  }}
                >
                  agent IA
                </motion.span>
              </motion.div>
            </div>

            <motion.p
              variants={fadeUp(0.9)}
              initial="hidden"
              animate="visible"
              style={{ fontSize: 'clamp(15px, 2vw, 16px)', color: textMuted, lineHeight: 1.65, maxWidth: '500px', marginTop: '8px', fontWeight: 400 }}
            >
              Importez vos conventions collectives, règlements et politiques internes.
              Vos collaborateurs obtiennent des réponses précises et sourcées, en quelques secondes.
            </motion.p>

            <motion.div
              variants={fadeUp(1.0)}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '32px' }}
            >
              {[
                'Réponses instantanées',
                'Basé sur vos documents internes',
                'Réponses sourcées',
                'Pipelines IA personnalisables'
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: accent, fontWeight: 700, fontSize: '22px' }}>✔</span>
                  <span style={{ color: textMuted, fontSize: '22px', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </motion.div>

          </motion.div>

          <motion.div
            variants={slideRight}
            initial="hidden"
            animate="visible"
            className="min-h-[560px] lg:min-h-0"
            style={{
              background: 'transparent', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s',
            }}
          >
            <div
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px)`,
                backgroundSize: '40px 40px', opacity: 0.5,
              }}
            />

            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{
                position: 'absolute', width: 320, height: 320, borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.55, ease: easing }}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '560px',
                display: 'grid',
                gridTemplateRows: '66% 34%',
                gap: 8,
              }}
            >
              <div
                style={{
                  background: 'transparent',
                  marginLeft: '0px'
                }}
              >
                <WorkflowPackagePreview isDark={isDark} />
              </div>

              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '65%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: accentDim,
                  border: `1px solid ${accentBorder}`,
                  borderRadius: '999px',
                  padding: '4px',
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 18px rgba(0,0,0,0.12)',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: surfaceAlt,
                    border: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textDim,
                  }}
                >
                  <Icon as={ArrowDown} boxSize={16} />
                </div>
              </motion.div>

              <ChatSimulationPanel
                isDark={isDark}
                accent={accent}
                accentDim={accentDim}
                accentBorder={accentBorder}
                border={border}
                surfaceAlt={surfaceAlt}
                textPrimary={textPrimary}
                textMuted={textMuted}
              />
            </motion.div>

            <motion.div
              className="hidden lg:flex"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5, ease: easing }}
              style={{
                position: 'absolute', left: '-22px', top: '30%', transform: 'translateY(-50%)',
                display: 'flex', flexDirection: 'column', gap: '4px',
                background: accentDim, border: `1px solid ${accentBorder}`,
                borderRadius: '999px', padding: '10px 8px',
                boxShadow: `0 4px 24px rgba(0,200,150,0.15)`, zIndex: 2,
              }}
            >
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={textDim}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> },
                { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill={textDim}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={textDim} strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, background: accent }}
                  whileTap={{ scale: 0.9 }}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: surfaceAlt, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {s.icon}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>

      <section
        style={{
          position: 'relative',
          padding: '96px 24px 110px',
          borderTop: `1px solid ${border}`,
          background: isDark ? '#0a0d10' : '#ffffffb0',
          overflow: 'hidden',
          boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.2)' : '0 8px 22px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
            opacity: isDark ? 0.35 : 0.22,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>
            <h2 style={{ color: textPrimary, fontSize: '54px', lineHeight: 1.05, letterSpacing: '-1px', fontWeight: 800, textAlign: 'center' }}>
              Les questions RH ne s&apos;arrêtent jamais
            </h2>
            <p style={{ color: textMuted, fontSize: '19px', maxWidth: 820, margin: '18px auto 0', textAlign: 'center', lineHeight: 1.65 }}>
              Congés, télétravail, conventions collectives, règlement intérieur… vos collaborateurs posent chaque jour des questions. Trouver la bonne réponse prend du temps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginTop: '42px' }}>
            {hrQuestions.map((question, idx) => (
              <motion.div
                key={question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                whileHover={{ y: -5, boxShadow: `0 0 0 1px ${accentBorder}, 0 18px 34px rgba(0,0,0,0.25)` }}
                style={{
                  background: isDark ? 'rgba(17,20,24,0.82)' : 'rgba(255,255,255,0.88)',
                  border: `1px solid ${accentBorder}`,
                  borderRadius: 14,
                  padding: '22px 22px',
                  color: textPrimary,
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: 1.45,
                  boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.25)' : '0 8px 22px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: `0 0 14px ${accent}` }} />
                  <span>{question}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginTop: '46px', textAlign: 'center', color: textPrimary, fontSize: '22px', fontWeight: 600 }}
          >
            GenRAG transforme vos documents RH en assistant IA de confiance.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: '30px' }}>
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: 14,
                  padding: '22px',
                  boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.2)' : '0 8px 22px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: accentDim, border: `1px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  {step.icon === 'doc' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  )}
                  {step.icon === 'pipeline' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                      <circle cx="6" cy="6" r="2" />
                      <circle cx="18" cy="6" r="2" />
                      <circle cx="12" cy="18" r="2" />
                      <path d="M8 7.5l2.8 7M16 7.5l-2.8 7M8 6h8" />
                    </svg>
                  )}
                  {step.icon === 'chat' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 9h8M8 13h6" />
                    </svg>
                  )}
                </div>
                <p style={{ color: textPrimary, fontSize: '17px', fontWeight: 700, lineHeight: 1.35 }}>{step.title}</p>
                <p style={{ color: textMuted, fontSize: '14px', lineHeight: 1.6, marginTop: 8 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '26px 24px 34px',
          borderTop: `1px solid ${border}`,
          background: isDark ? '#0a0d10' : '#ffffffb0',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          <ModelCompatibilityStrip
            accent={accent}
            accentDim={accentDim}
            accentBorder={accentBorder}
            border={border}
            surfaceAlt={surfaceAlt}
            textPrimary={textPrimary}
            textMuted={textMuted}
          />
        </div>
      </section>

      <FeaturesBentoSection
        isDark={isDark}
        accent={accent}
        accentDim={accentDim}
        accentBorder={accentBorder}
        border={border}
        textPrimary={textPrimary}
        textMuted={textMuted}
      />
      <SiteFooter
        isDark={isDark}
        accent={accent}
        border={border}
        textPrimary={textPrimary}
        textMuted={textMuted}
      />
    </div>
  );
}
