import React from 'react';
import { motion } from 'framer-motion';

type SiteFooterProps = {
  isDark: boolean;
  accent: string;
  border: string;
  textPrimary: string;
  textMuted: string;
};

export function SiteFooter({ isDark, accent, border, textPrimary, textMuted }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: 'Product',
      links: ['Workflow Builder', 'AI Chat', 'Source Citations'],
    },
    {
      title: 'Company',
      links: ['About', 'Security', 'Contact'],
    },
    {
      title: 'Resources',
      links: ['Documentation', 'Guides', 'Status'],
    },
  ];

  return (
    <footer
      style={{
        position: 'relative',
        borderTop: `1px solid ${border}`,
        background: isDark ? '#080b0f' : '#f3f3f3',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px)`,
          backgroundSize: '42px 42px',
          opacity: isDark ? 0.22 : 0.14,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '42px 24px 24px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8" style={{ paddingBottom: 26 }}>
          <div className="lg:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="grid grid-cols-3 gap-1" style={{ width: 20, height: 20 }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: 1, background: accent }} />
                ))}
              </div>
              <span style={{ color: accent, fontWeight: 800, fontSize: 24 }}>GenRAG</span>
            </div>

            <p style={{ color: textMuted, fontSize: 14, lineHeight: 1.65, marginTop: 14, maxWidth: 360 }}>
              AI assistant for HR knowledge. Reliable answers grounded in your company documents.
            </p>
          </div>

          {columns.map((column, columnIndex) => (
            <div key={column.title}>
              <p style={{ color: textPrimary, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{column.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {column.links.map((link, linkIndex) => (
                  <motion.a
                    key={link}
                    href="#"
                    whileHover={{ x: 3, color: accent }}
                    transition={{ duration: 0.2, delay: (columnIndex + linkIndex) * 0.01 }}
                    style={{ color: textMuted, fontSize: 13, textDecoration: 'none' }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: `1px solid ${border}`,
            paddingTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <p style={{ color: textMuted, fontSize: 12 }}>© {year} GenRAG. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="#" style={{ color: textMuted, fontSize: 12, textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: textMuted, fontSize: 12, textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: textMuted, fontSize: 12, textDecoration: 'none' }}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
