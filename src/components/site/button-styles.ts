import { cn } from '@/lib/utils';

/**
 * Shared button/link visual language.
 *
 * The old buttons were flat (`bg-foreground` / plain border) with only a
 * color transition. These add the premium interaction set from the redesign
 * brief — gradient surface, soft glow, hover lift + scale, active press —
 * while staying inside the existing token system (`--brand`, `--accent-2`,
 * radius). No new colors, no new dependencies.
 *
 * Kept as plain className strings (not a <Button> component) because every
 * call site is a different element — `<a>`, `<button type="submit">`, a
 * mobile drawer link — and the site layer stays server-renderable where
 * possible; wrapping everything in a client component would cost more than
 * it buys here.
 */

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium ' +
  'transition-all duration-300 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100';

/** Primary CTA — brand gradient, glow on hover, lifts + scales, presses on click. */
export function primaryButtonClass(extra?: string) {
  return cn(
    base,
    'relative overflow-hidden px-5 py-2.5 font-semibold',
    'bg-gradient-to-br from-brand via-brand to-[color-mix(in_oklab,var(--brand)_75%,black)] text-brand-foreground',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.16)_inset,0_8px_20px_-8px_var(--brand)]',
    'hover:-translate-y-0.5 hover:scale-[1.015] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_14px_32px_-10px_var(--brand)]',
    'active:translate-y-0 active:scale-[0.98] active:shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_6px_16px_-8px_var(--brand)]',
    extra
  );
}

/** Secondary — glass/outline, brand tint on hover. For the CTA next to a primary button. */
export function secondaryButtonClass(extra?: string) {
  return cn(
    base,
    'border border-border bg-background/60 px-5 py-2.5 text-foreground backdrop-blur-sm',
    'hover:-translate-y-0.5 hover:border-brand/50 hover:bg-brand/[0.06] hover:shadow-md hover:shadow-brand/10',
    'active:translate-y-0 active:scale-[0.98]',
    extra
  );
}

/** Quiet — text-only, for tertiary actions (e.g. "Resume" next to two other CTAs). */
export function quietButtonClass(extra?: string) {
  return cn(
    base,
    'px-3 py-2.5 text-muted-foreground hover:text-foreground hover:-translate-y-0.5',
    'active:translate-y-0 active:scale-[0.97]',
    extra
  );
}

/** Square icon button — socials, hamburger. Subtle rotate reads as a wink, not a gimmick. */
export function iconButtonClass(extra?: string) {
  return cn(
    'inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground',
    'transition-all duration-300 ease-out',
    'hover:-translate-y-0.5 hover:rotate-6 hover:border-brand/40 hover:text-foreground hover:shadow-md hover:shadow-brand/10',
    'active:translate-y-0 active:scale-90 active:rotate-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    extra
  );
}

/** GitHub-style pill — monospace-adjacent, neutral, "source code" register. */
export function githubPillClass(extra?: string) {
  return cn(
    base,
    'border border-border bg-background/50 px-2.5 py-1.5 text-xs text-muted-foreground backdrop-blur-sm',
    'hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-sm',
    'active:translate-y-0 active:scale-[0.97]',
    extra
  );
}

/** Live/demo pill — filled brand gradient with a resting pulse glow, distinct from GitHub on purpose. */
export function livePillClass(extra?: string) {
  return cn(
    base,
    'relative px-2.5 py-1.5 text-xs font-semibold text-brand-foreground',
    'bg-gradient-to-br from-brand to-[color-mix(in_oklab,var(--brand)_78%,black)]',
    'shadow-[0_4px_14px_-6px_var(--brand)]',
    'hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_8px_20px_-6px_var(--brand)]',
    'active:translate-y-0 active:scale-[0.96]',
    extra
  );
}
