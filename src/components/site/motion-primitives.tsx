'use client';

import React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotionSafe } from './use-motion-preference';
import { Tilt, TiltContent } from '@/components/animate-ui/primitives/effects/tilt';

/**
 * Magnetic — the wrapped element drifts subtly toward the cursor and springs
 * back on leave. Disabled entirely under prefers-reduced-motion.
 */
export function Magnetic({
  children,
  className,
  strength = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotionSafe();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverLift — springs the element up a few px on hover for tactile depth.
 * Height stays full so it composes with flex/grid layouts. Reduced-motion safe.
 */
export function HoverLift({
  children,
  className,
  y = -4,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * TiltCard — pointer-driven 3D tilt, wrapping Animate UI's Tilt primitive.
 *
 * Lives here rather than being used raw at call sites so the reduced-motion
 * check stays in one place, matching Magnetic and HoverLift above. Under
 * reduced motion the children render with no wrapper, no springs and no
 * mousemove listener at all, rather than a tilt of zero degrees.
 *
 * Deliberately applied to whole cards, not to the small skill chips the
 * upgrade brief suggested. There are 58 of those, and each Tilt instantiates
 * two motion values, two springs, a mousemove handler and a `will-change:
 * transform` layer. That is a lot of standing cost for decoration on an
 * element the size of a word. On a card it reads as depth and costs seven
 * instances.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 6,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const reduce = useReducedMotionSafe();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <Tilt maxTilt={maxTilt} perspective={1000} className={className}>
      <TiltContent className="h-full">{children}</TiltContent>
    </Tilt>
  );
}
