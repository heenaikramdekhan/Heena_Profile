import { ImageResponse } from 'next/og';

/**
 * Social share card, generated at build time.
 *
 * Deliberately code-generated rather than a checked-in PNG: the positioning
 * line is the whole pitch, and it should never drift out of sync with the
 * site because someone forgot to re-export an image. Next picks this up by
 * file convention and populates og:image / twitter:image automatically.
 */

export const alt =
  'Heena, QA Engineer and AI Engineer. I break AI systems before your users do, then build the ones that don’t break.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BRAND = '#6366f1';
const ACCENT = '#22d3ee';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#08080b',
          backgroundImage: `radial-gradient(circle at 78% 18%, ${BRAND}2e 0%, transparent 45%), radial-gradient(circle at 12% 88%, ${ACCENT}22 0%, transparent 42%)`,
          padding: '72px 80px',
        }}
      >
        {/* top: role line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              height: 14,
              width: 14,
              borderRadius: 99,
              backgroundColor: ACCENT,
            }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#9ca3af',
            }}
          >
            QA Engineer × AI Engineer
          </div>
        </div>

        {/* middle: name + positioning */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 92,
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: -3,
            }}
          >
            Heena
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 40,
              lineHeight: 1.32,
              color: '#c9cbd1',
              maxWidth: 960,
            }}
          >
            I break AI systems before your users do, then build the ones that
            don’t break.
          </div>
        </div>

        {/* bottom: proof strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {['Adversarial testing', 'LLM evaluation', 'Multi-agent & RAG'].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: '#d4d4d8',
                  border: '1px solid #2a2a33',
                  borderRadius: 99,
                  padding: '10px 24px',
                }}
              >
                {chip}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
