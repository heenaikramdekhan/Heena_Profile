'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Scroll-reveal wrapper. Fades + lifts children into view once.
 * Under prefers-reduced-motion it renders statically — no fade, no lift.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hairline that draws itself out from the eyebrow as the section arrives.
 * Animates `scaleX` only, so it costs no layout. Rendered as a static full
 * width rule under prefers-reduced-motion rather than dropped, because it is
 * doing visual work (separating the eyebrow from the page) beyond the motion.
 */
function HeadingRule() {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className="via-border h-px flex-1 bg-gradient-to-r from-brand/40 to-transparent" />;
  }

  return (
    <motion.span
      aria-hidden
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="via-border h-px flex-1 origin-left bg-gradient-to-r from-brand/40 to-transparent"
    />
  );
}

interface SectionProps {
  id: string;
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent section shell: anchor id, mono eyebrow (NN / label),
 * heading, optional lede, and content. Keeps vertical rhythm uniform.
 */
export function Section({
  id,
  index,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-20 md:py-28', className)}>
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="mb-10 md:mb-14">
            <div className="flex items-center gap-3">
              <span className="text-brand shrink-0 font-mono text-xs font-medium tracking-widest uppercase">
                {index} / {title}
              </span>
              <HeadingRule />
            </div>
            <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground mt-3 max-w-2xl text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export default Section;
