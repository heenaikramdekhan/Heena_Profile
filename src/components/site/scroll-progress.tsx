'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Thin progress bar tracking scroll position through the page, pinned under
 * the navbar. Built on `useScroll` + a spring, so it animates via `scaleX`
 * transform only — no layout, no per-frame React re-render.
 *
 * Hidden under prefers-reduced-motion: a moving bar tied to scroll is exactly
 * the kind of motion that spec is meant to suppress, and it carries no
 * information the page doesn't already convey.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 32,
    mass: 0.2,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="from-brand via-brand to-accent2 fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r"
    />
  );
}

export default ScrollProgress;
