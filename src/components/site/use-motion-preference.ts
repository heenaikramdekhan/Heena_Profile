'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * `prefers-reduced-motion`, but stable across hydration.
 *
 * Use this everywhere in `site/*` instead of framer-motion's `useReducedMotion`.
 *
 * Why it exists: framer's hook reads `matchMedia` during the *first* client
 * render, and the server has no way to know a visitor's preference, so it always
 * prerenders the animated branch. Every component that branches on the value
 * therefore rendered one thing on the server and another on the client's first
 * pass. React treats that as a hydration failure, throws away the server tree
 * and re-renders the entire page on the client, for every visitor who has the
 * preference set. It showed up as a single console error (React #418) because
 * React reports only the first mismatch it hits and then bails out, which hid
 * how many components were actually diverging.
 *
 * This reports `false` until after mount, so the server render and the first
 * client render agree, and the real value arrives on the next pass.
 *
 * Reduced-motion visitors therefore get one frame of the animated markup, and
 * they never see it move: `globals.css` carries a `prefers-reduced-motion` net
 * that flattens animation and transition durations to near zero. That net is
 * plain CSS, so it applies from the very first paint, before this hook has
 * reported anything.
 */
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && (reduce ?? false);
}
