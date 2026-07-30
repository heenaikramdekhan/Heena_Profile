'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotionSafe } from './use-motion-preference';

/**
 * Word-by-word reveal as a block of copy scrolls into view.
 *
 * Presentation only. The string passed in is rendered verbatim, never
 * reformatted, retyped or regenerated: the site's voice is a hard constraint
 * and an animation is not a reason to touch a single word of it.
 *
 * Accessibility: splitting a sentence into spans would otherwise make screen
 * readers announce it word by word, so the container carries the whole string
 * as its `aria-label` and every fragment is `aria-hidden`. Assistive tech gets
 * one clean sentence, sighted users get the effect. Spaces are real text nodes
 * between the spans rather than padding inside them, so wrapping, selection
 * and copy-paste all behave normally.
 *
 * No blur in the variant on purpose. A blur filter per word is genuinely
 * expensive once a paragraph runs past a hundred words, and opacity plus a
 * small rise reads the same at this size.
 *
 * Under reduced motion the text renders as a plain element with no splitting,
 * no stagger and no observer.
 */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.016 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: '0.3em' },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export function TextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduce = useReducedMotionSafe();

  if (reduce) return <p className={className}>{text}</p>;

  const words = text.split(' ');

  return (
    <motion.p
      aria-label={text}
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {words.map((w, i) => (
        <React.Fragment key={`${w}-${i}`}>
          <motion.span aria-hidden variants={word} className="inline-block">
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </motion.p>
  );
}

export default TextReveal;
