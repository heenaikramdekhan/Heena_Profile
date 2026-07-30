'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotionSafe } from './use-motion-preference';
import { cn } from '@/lib/utils';

/**
 * Shared treatment for the small capability pills: tech stacks on projects,
 * technologies on roles, individual skills on the skills cards.
 *
 * Before this they were three near-identical but subtly different flat spans
 * (one filled, two outlined, different padding) and the only element on the
 * page with no interaction at all. Now they share one surface, lift under the
 * cursor, and stagger in as their row scrolls into view.
 *
 * `TagRow` owns the stagger so the delay comes from sibling order rather than
 * every call site having to pass an index. Both halves drop to plain markup
 * under prefers-reduced-motion: no stagger, no lift, no scale.
 */

const rowVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.04 } },
};

const tagVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export type TagTone = 'default' | 'accent';

/** Surface + hover. Exported so a non-animated context can reuse the look. */
export function tagClass(tone: TagTone = 'default', motionOk = true) {
  return cn(
    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
    'transition-[transform,color,border-color,box-shadow,background-color] duration-300 ease-out',
    motionOk && 'hover:-translate-y-0.5',
    tone === 'accent'
      ? 'border-accent2/30 bg-accent2/[0.06] text-accent2/90 hover:border-accent2/60 hover:bg-accent2/[0.12] hover:text-accent2 hover:shadow-[0_6px_16px_-8px_var(--accent-2)]'
      : 'border-border bg-gradient-to-b from-muted/70 to-muted/40 text-muted-foreground hover:border-brand/45 hover:text-foreground hover:shadow-[0_6px_16px_-8px_var(--brand)]',
  );
}

export function TagRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotionSafe();

  if (reduce) {
    return <div className={cn('flex flex-wrap gap-1.5', className)}>{children}</div>;
  }

  return (
    <motion.div
      variants={rowVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {children}
    </motion.div>
  );
}

export function Tag({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: TagTone;
}) {
  const reduce = useReducedMotionSafe();

  if (reduce) {
    return <span className={tagClass(tone, false)}>{children}</span>;
  }

  return (
    <motion.span variants={tagVariants} className={tagClass(tone)}>
      {children}
    </motion.span>
  );
}

export default Tag;
