'use client';

import React from 'react';
import { useReducedMotionSafe } from './use-motion-preference';
import {
  RippleButton,
  RippleButtonRipples,
} from '@/components/animate-ui/primitives/buttons/ripple';

/**
 * Adds a click ripple to an existing CTA without taking over its styling.
 *
 * `button-styles.ts` already owns the whole button language: gradient surface,
 * hover lift, hover scale, active press. RippleButton ships its own hoverScale
 * and tapScale, which would compound with those and make the buttons bounce,
 * so both are pinned to 1 here. The library contributes the ripple and nothing
 * else.
 *
 * Wraps rather than replaces, so every call site keeps its own element. The
 * CTAs are a mix of <a> and <button type="submit"> and that distinction is
 * load-bearing for semantics and for the contact form.
 *
 * Ripple colour is derived from theme tokens, not hardcoded: light on the
 * filled brand surface, brand-tinted on the glass one.
 */

type Tone = 'primary' | 'secondary';

const RIPPLE_COLOR: Record<Tone, string> = {
  primary: 'color-mix(in oklab, var(--brand-foreground) 55%, transparent)',
  secondary: 'color-mix(in oklab, var(--brand) 32%, transparent)',
};

export function Ripple({
  children,
  tone = 'primary',
}: {
  children: React.ReactElement;
  tone?: Tone;
}) {
  const reduce = useReducedMotionSafe();

  // A ripple is purely decorative motion, so it is dropped entirely rather
  // than shortened. The element passes through untouched.
  if (reduce) return children;

  const child = children as React.ReactElement<{ children?: React.ReactNode }>;

  return (
    <RippleButton asChild hoverScale={1} tapScale={1}>
      {React.cloneElement(
        child,
        undefined,
        <>
          {child.props.children}
          <RippleButtonRipples color={RIPPLE_COLOR[tone]} />
        </>,
      )}
    </RippleButton>
  );
}

export default Ripple;
