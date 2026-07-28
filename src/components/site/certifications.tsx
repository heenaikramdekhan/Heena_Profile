'use client';

import Image from 'next/image';
import React from 'react';
import {
  Award,
  HeartHandshake,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { ImageZoom } from '@/components/animate-ui/primitives/effects/image-zoom';
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

/**
 * Initials for the monogram fallback. Drops the leading article and the
 * generic words that every one of these bodies shares, so "Aga Khan Social
 * Welfare Local Board Gilgit" gives AK rather than AK from "Aga" + "Khan"
 * being indistinguishable from the next board along.
 */
const FILLER = /^(the|of|and|for|local|board|council|national)$/i;

function monogram(text: string) {
  const words = text
    .replace(/[(),·]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !FILLER.test(w));
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase();
}

/**
 * Organisation mark. A real logo when one is supplied, otherwise a monogram.
 * Only rendered when it earns its place: either there is a logo to show, or
 * the card has no scan and would otherwise be a bare line of text.
 */
function Mark({ cert }: { cert: Certification }) {
  // Only alongside a scan. Without one the media panel already shows the logo
  // at full size, and repeating it beside the title reads as a duplicate.
  if (!cert.image || !cert.logo) return null;

  if (cert.logo) {
    return (
      // White surface on purpose, matching the certificate panels. These marks
      // are supplied on a white ground, and keying the white out would hollow
      // the ones whose design uses it (the Ismaili Volunteers roundel is blue
      // linework on white, so it would read as a broken ring on a dark card).
      <span className="border-border relative h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-white">
        <Image
          src={cert.logo}
          alt={cert.issuer ? `${cert.issuer} logo` : `${cert.name} logo`}
          fill
          sizes="36px"
          className="object-contain p-0.5"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="border-border bg-muted/60 text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold"
    >
      {monogram(cert.issuer || cert.name)}
    </span>
  );
}

/**
 * The card's media band. Always rendered, and never empty: a certificate scan
 * where one exists, otherwise the organisation logo, otherwise a monogram.
 *
 * An earlier version reserved an *empty* panel on scanless cards purely to
 * equalise heights, which looked like a broken image and was rightly rejected.
 * This is the opposite: the panel always carries the strongest identifying
 * mark the entry has, so a role with no certificate (AKYSB, Ismaili
 * Volunteers) still reads as a finished card rather than a stub, and every
 * card shares one silhouette so grid rows line up.
 */
function MediaPanel({ cert }: { cert: Certification }) {
  // useReducedMotion returns boolean | null; null means "not measured yet",
  // which for our purposes is the same as "motion allowed".
  const reduce = useReducedMotion() ?? false;

  if (cert.image) {
    return (
      <div className="border-border relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b bg-white">
        {/*
          Hover-to-zoom so the scan is actually readable in place. Click zoom is
          off on purpose: most of these cards are wrapped in an <a> to the
          issuer's verify page, so a click has to stay navigation. Disabled
          under reduced motion, which also restores the default cursor.
        */}
        <ImageZoom
          zoomOnHover={!reduce}
          zoomOnClick={false}
          disabled={reduce}
          zoomScale={2.4}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          className="h-full w-full"
        >
          <div className="relative h-full w-full">
            <Image
              src={cert.image}
              alt={`${cert.name} certificate`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain"
            />
          </div>
        </ImageZoom>
      </div>
    );
  }

  if (cert.logo) {
    return (
      <div className="border-border relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b bg-white">
        <Image
          src={cert.logo}
          alt={cert.issuer ? `${cert.issuer} logo` : `${cert.name} logo`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-[18%]"
        />
      </div>
    );
  }

  return (
    <div className="border-border bg-muted/40 flex aspect-[16/10] w-full shrink-0 items-center justify-center border-b">
      <span
        aria-hidden
        className="text-muted-foreground/70 font-mono text-3xl font-semibold tracking-widest"
      >
        {monogram(cert.issuer || cert.name)}
      </span>
    </div>
  );
}

function Card({ cert }: { cert: Certification }) {
  const meta = [cert.issuer, cert.date].filter(Boolean).join(' · ');
  const linked = Boolean(cert.url);

  const inner = (
    <div
      className={
        'border-border bg-card group/cert flex h-full flex-col overflow-hidden rounded-xl border transition-[box-shadow] duration-300 ' +
        (linked ? 'card-glow-border hover:shadow-brand/10 hover:shadow-lg' : '')
      }
    >
      {/* Only rendered when there's an actual scan. An earlier version
          reserved this panel on every card so row heights matched, but that
          left large empty boxes leading the section. The grid uses
          `items-start` instead, so text-only cards simply stay short. */}
      <MediaPanel cert={cert} />

      <div className="flex flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <Mark cert={cert} />
            <h4 className="text-foreground text-sm leading-snug font-medium">
              {cert.name}
            </h4>
          </div>
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

/** How many cards a band shows before the reveal control appears. */
const INITIAL_VISIBLE = 6;

/**
 * One credential band: heading, a three-up grid, and a progressive reveal.
 *
 * Layout note, because this reverses an earlier decision recorded in
 * CLAUDE.md. The band used to be CSS multi-column, chosen because card heights
 * varied by roughly 4x between a card with a scan and a name-only card, and a
 * grid left dead vertical gaps. That reason no longer holds: every scan is now
 * normalised to the panel's 16:10, and MediaPanel guarantees each card has a
 * media band of identical height, so cards differ only by their text. A grid
 * therefore lines rows up cleanly, which is what multi-column could never do,
 * and it restores row-major reading order as a bonus.
 */
function Band({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Certification[];
}) {
  const [expanded, setExpanded] = React.useState(false);
  const canCollapse = items.length > INITIAL_VISIBLE;
  const visible = expanded || !canCollapse ? items : items.slice(0, INITIAL_VISIBLE);
  const hidden = items.length - visible.length;

  return (
    <div>
      <Reveal>
        <div className="mb-4 flex items-center gap-3">
          <span className="bg-brand/10 text-brand flex h-8 w-8 items-center justify-center rounded-md">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-muted-foreground font-mono text-xs font-semibold tracking-widest uppercase">
            {label}
          </h3>
          <span className="bg-border h-px flex-1" />
          <span
            aria-live="polite"
            className="text-muted-foreground font-mono text-[11px]"
          >
            {visible.length} of {items.length}
          </span>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((cert, i) => (
          <Reveal key={cert.name} delay={Math.min(i, 5) * 0.04}>
            <HoverLift y={-3} className="h-full">
              <Card cert={cert} />
            </HoverLift>
          </Reveal>
        ))}
      </div>

      {canCollapse && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="border-border text-muted-foreground hover:text-foreground hover:border-brand/45 hover:shadow-brand/10 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-[color,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            {expanded ? (
              <>
                Show fewer
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Show {hidden} more
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
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
      <div className="space-y-12">
        {bands.map((band) => (
          <Band
            key={band.label}
            label={band.label}
            icon={band.icon}
            items={band.items}
          />
        ))}
      </div>
    </Section>
  );
}

export default Certifications;
