'use client';

import React from 'react';

/**
 * Fixed "you are here" rail down the right edge of the page.
 *
 * Deliberately additive to ScrollProgress rather than a replacement. The
 * progress bar answers "how far through am I"; on a page this tall that leaves
 * the more useful question unanswered, which is "which section am I in and
 * what else is there". This answers that, and doubles as navigation.
 *
 * Active state comes from an IntersectionObserver rather than scroll maths, so
 * it costs nothing per frame and stays correct regardless of whether Lenis,
 * native scrolling or a keyboard is driving.
 *
 * Motion note: this is not gated on prefers-reduced-motion, because it is not
 * motion. It is a static indicator whose only animation is a short colour and
 * width transition, which the global reduced-motion net in globals.css already
 * flattens. Removing it under that setting would take away wayfinding from the
 * people most likely to want it.
 *
 * Hidden below xl: there is no gutter to put it in on narrow viewports, and
 * the navbar already covers navigation there.
 */

const SECTIONS = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'experience', label: 'Experience', index: '02' },
  { id: 'projects', label: 'Projects', index: '03' },
  { id: 'skills', label: 'Skills', index: '04' },
  { id: 'certifications', label: 'Certifications', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
];

export function SectionRail() {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    // A band across the upper-middle of the viewport. Using a band rather than
    // a single line stops the active item flickering between two sections when
    // a boundary sits exactly at the trigger point.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="pointer-events-none fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 xl:block"
    >
      <ul className="flex flex-col gap-1">
        {SECTIONS.map((section) => {
          const isActive = active === section.id;
          return (
            <li key={section.id} className="pointer-events-auto">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                className="group flex items-center justify-end gap-2.5 py-1.5"
              >
                <span
                  className={
                    'font-mono text-[10px] tracking-widest uppercase transition-colors duration-300 ' +
                    (isActive
                      ? 'text-brand'
                      : 'text-muted-foreground/0 group-hover:text-muted-foreground')
                  }
                >
                  {section.label}
                </span>
                <span
                  aria-hidden
                  className={
                    'block h-px transition-[width,background-color] duration-300 ' +
                    (isActive
                      ? 'bg-brand w-7'
                      : 'bg-border group-hover:bg-muted-foreground w-3.5')
                  }
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default SectionRail;
