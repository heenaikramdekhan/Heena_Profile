'use client';

import React from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useReducedMotionSafe } from './use-motion-preference';
import 'lenis/dist/lenis.css';

/**
 * Lenis smooth scrolling for the whole page.
 *
 * Reduced motion is handled by not mounting the smoothing layer at all, rather
 * than by configuring Lenis to be instant. Lenis has no built-in
 * prefers-reduced-motion switch, and a layer that rewrites scrollTop every
 * frame is exactly what that setting exists to opt out of. With it off the
 * browser's native scrolling takes over untouched.
 *
 * Note on CSS: this project sets `scroll-behavior: smooth` (globals.css and
 * the `scroll-smooth` class on <html>). Lenis used to neutralise that in its
 * own stylesheet, but as of 1.3.x it no longer does, so native smooth
 * scrolling and Lenis would both try to animate the same scrollTop. The
 * `lenis-active` class below turns the native one off only while Lenis is
 * mounted, which keeps the reduced-motion path on plain CSS.
 */

/**
 * Routes in-page anchor clicks through Lenis.
 *
 * Without this, a `#projects` link performs a native jump: Lenis does not
 * intercept anchor navigation, and with native smooth scrolling disabled (see
 * above) the jump would be instant, which is a regression from what the site
 * did before.
 *
 * No offset is passed on purpose. Lenis already subtracts the target's
 * `scroll-margin-top` and the root's `scroll-padding-top` when resolving an
 * element, and this site sets both (`scroll-mt-20` on every Section, plus
 * `scroll-padding-top: 5rem` in globals.css). Adding a navbar offset here made
 * that a third subtraction and overshot by 80px. Leaving it out means anchor
 * landings match what native scrolling already did.
 */
function AnchorScroll() {
  const lenis = useLenis();

  React.useEffect(() => {
    if (!lenis) return;

    function onClick(event: MouseEvent) {
      // Let the browser handle anything that is not a plain left click:
      // modifier clicks open tabs/windows and must not be hijacked.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#') return;
      if (anchor.target && anchor.target !== '_self') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      lenis!.scrollTo(target as HTMLElement);
      // Keep the URL in step so the link is still shareable and the back
      // button behaves, without triggering a second native jump.
      window.history.pushState(null, '', href);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotionSafe();

  // Only suppress native smooth scrolling while Lenis is actually driving.
  React.useEffect(() => {
    if (reduce) return;
    document.documentElement.classList.add('lenis-active');
    return () => document.documentElement.classList.remove('lenis-active');
  }, [reduce]);

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <AnchorScroll />
      {children}
    </ReactLenis>
  );
}

/**
 * Pauses Lenis while an overlay owns the viewport.
 *
 * A fixed overlay plus `overflow: hidden` on body does not stop Lenis: it
 * keeps handling wheel and touch and keeps writing scrollTop, so the page
 * creeps along behind the overlay and the overlay's own scrollable areas feel
 * wrong. Callers pass their existing open state.
 *
 * Safe to call when Lenis is not mounted (reduced motion): `useLenis` returns
 * undefined and this becomes a no-op. It must still be called unconditionally
 * to satisfy the rules of hooks.
 */
export function useLenisPaused(paused: boolean) {
  const lenis = useLenis();

  React.useEffect(() => {
    if (!lenis) return;
    if (paused) {
      lenis.stop();
      return () => lenis.start();
    }
    lenis.start();
  }, [lenis, paused]);
}

export default SmoothScroll;
