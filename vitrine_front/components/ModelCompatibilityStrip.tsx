import React, { useMemo, useState } from 'react';
import {
  siAnthropic,
  siGooglegemini,
  siMistralai,
  siOllama,
  siX,
  siOpenaigym,
} from 'simple-icons';

type ModelCompatibilityStripProps = {
  accent: string;
  accentDim: string;
  accentBorder: string;
  border: string;
  surfaceAlt: string;
  textPrimary: string;
  textMuted: string;
};

type ModelItem = {
  name: string;
  iconPath: string;
};

const MODELS: ModelItem[] = [
  { name: 'GPT', iconPath: siOpenaigym.path },
  { name: 'Gemini', iconPath: siGooglegemini.path },
  { name: 'Claude', iconPath: siAnthropic.path },
  { name: 'Grok', iconPath: siX.path },
  { name: 'Mistral', iconPath: siMistralai.path },
  { name: 'Llama', iconPath: siOllama.path },
];

export function ModelCompatibilityStrip({
  accent,
  accentDim,
  accentBorder,
  surfaceAlt,
  textPrimary,
  textMuted,
}: ModelCompatibilityStripProps) {
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const headline = useMemo(() => activeModel ?? 'tous les modèles', [activeModel]);

  return (
    <div
      style={{
        marginTop: '20px',
        width: '100%',
        padding: '4px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
      }}
    >
      <div style={{ minWidth: 210 }}>
        <p style={{ color: textMuted, fontSize: '32px', fontWeight: 500, lineHeight: 1.2 }}>
          Compatible avec
        </p>
        <p style={{ color: textPrimary, fontSize: '32px', fontWeight: 800, lineHeight: 1.05, marginTop: 2 }}>
          {headline}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {MODELS.map((model) => {
          const isActive = activeModel === model.name;

          return (
            <button
              key={model.name}
              type="button"
              onMouseEnter={() => setActiveModel(model.name)}
              onMouseLeave={() => setActiveModel(null)}
              onFocus={() => setActiveModel(model.name)}
              onBlur={() => setActiveModel(null)}
              aria-label={`Afficher le modèle ${model.name}`}
              style={{
                width: 82,
                height: 82,
                borderRadius: '12px',
                border: `1px solid ${isActive ? accentBorder : "transparent"}`,
                background: isActive ? accentDim : surfaceAlt,
                color: isActive ? accent : textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 4,
              }}
              title={model.name}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={model.iconPath} fill="currentColor" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
