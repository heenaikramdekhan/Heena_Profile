'use client';

import Image from 'next/image';
import { Award, HeartHandshake, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import type { Certification } from '@/types/portfolio';
import { Section, Reveal } from './section';
import { HoverLift } from './motion-primitives';

/**
 * Certificates, split into technical and volunteering.
 *
 * The certificate scan leads the card, because a visible document is more
 * persuasive than a title in a list. Every field except `name` is optional and
 * rendered conditionally, so a half-filled entry still looks deliberate rather
 * than broken: no scan falls back to a text-only card, and no `url` just drops
 * the verify affordance. Groups with no entries are dropped entirely, so the
 * volunteering band does not appear until it has something in it.
 */

function Card({ cert }: { cert: Certification }) {
  const meta = [cert.issuer, cert.date].filter(Boolean).join(' · ');
  const linked = Boolean(cert.url);

  const inner = (
    <div
      className={
        'border-border bg-card group/cert flex flex-col overflow-hidden rounded-xl border transition-[box-shadow] duration-300 ' +
        (linked ? 'card-glow-border hover:shadow-brand/10 hover:shadow-lg' : '')
      }
    >
      {/* Only rendered when there's an actual scan. An earlier version
          reserved this panel on every card so row heights matched, but that
          left large empty boxes leading the section. The grid uses
          `items-start` instead, so text-only cards simply stay short. */}
      {cert.image && (
        <div className="border-border relative aspect-[16/10] w-full overflow-hidden border-b bg-white">
          <Image
            src={cert.image}
            alt={`${cert.name} certificate`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
      )}

      <div className="flex flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-foreground text-sm leading-snug font-medium">
            {cert.name}
          </h4>
          {linked && (
            <ArrowUpRight className="text-muted-foreground group-hover/cert:text-foreground mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors" />
          )}
        </div>

        {meta && (
          <p className="text-muted-foreground mt-2 font-mono text-xs leading-relaxed tracking-wide">
            {meta}
          </p>
        )}

        {cert.includes && cert.includes.length > 0 && (
          <div className="border-border/70 mt-3 border-l pl-3">
            <span className="text-muted-foreground/80 font-mono text-[10px] font-semibold tracking-widest uppercase">
              {cert.includes.length} courses
            </span>
            <ul className="mt-1.5 space-y-1">
              {cert.includes.map((course) => (
                <li
                  key={course}
                  className="text-muted-foreground text-xs leading-snug"
                >
                  {course}
                </li>
              ))}
            </ul>
          </div>
        )}

        {linked && (
          <span className="text-brand mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verify credential
          </span>
        )}
      </div>
    </div>
  );

  if (!linked) return inner;

  return (
    <a
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
      aria-label={`${cert.name}, verify credential`}
    >
      {inner}
    </a>
  );
}

export function Certifications() {
  const { certifications } = getConfig();
  const all = certifications ?? [];

  const bands = [
    {
      label: 'Technical',
      icon: Award,
      items: all.filter((c) => c.kind === 'technical'),
    },
    {
      label: 'Volunteering',
      icon: HeartHandshake,
      items: all.filter((c) => c.kind === 'volunteering'),
    },
  ].filter((b) => b.items.length > 0);

  if (bands.length === 0) return null;

  return (
    <Section
      id="certifications"
      index="05"
      title="Certifications"
      description="Coursework and credentials on the technical side, plus the volunteering I've done alongside it."
    >
      <div className="space-y-10">
        {bands.map((band) => (
          <div key={band.label}>
            <Reveal>
              <div className="mb-4 flex items-center gap-3">
                <span className="bg-brand/10 text-brand flex h-8 w-8 items-center justify-center rounded-md">
                  <band.icon className="h-4 w-4" />
                </span>
                <h3 className="text-muted-foreground font-mono text-xs font-semibold tracking-widest uppercase">
                  {band.label}
                </h3>
                <span className="bg-border h-px flex-1" />
                <span className="text-muted-foreground font-mono text-[11px]">
                  {band.items.length}
                </span>
              </div>
            </Reveal>

            {/* Multi-column rather than grid. Card heights vary a lot (a scan
                is ~4x the height of a name-only card), and a grid would leave
                dead vertical gaps wherever a short card sits beside a tall
                one. Columns pack them and self-balance. Order becomes
                column-major, which is fine for an unordered credential list. */}
            <div className="columns-1 gap-4 sm:columns-2">
              {band.items.map((cert, i) => (
                <Reveal
                  key={cert.name}
                  delay={i * 0.04}
                  className="mb-4 break-inside-avoid"
                >
                  <HoverLift y={-3}>
                    <Card cert={cert} />
                  </HoverLift>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Certifications;
