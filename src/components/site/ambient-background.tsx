'use client';

import React from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

/**
 * Page-wide decorative background.
 *
 * Fixed rather than per-section, so the glow stays put while content scrolls
 * past it and every section sits on the same surface. Purely presentational,
 * hence `aria-hidden` and `pointer-events-none`.
 *
 * Layers, back to front:
 *  1. two gradient meshes drifting on 32s / 47s cycles in opposite directions
 *     (co-prime-ish periods, so the loop never visibly repeats)
 *  2. a slow scan band travelling down the page
 *  3. the base dot grid
 *  4. a brighter dot grid revealed only inside a mask that follows the cursor
 *  5. a soft brand glow under the cursor
 *  6. film grain, then a scrim that protects text contrast over the mesh
 *
 * Cursor tracking is driven entirely by motion values and springs, so pointer
 * movement never triggers a React re-render. Everything interactive or moving
 * is dropped under `prefers-reduced-motion`.
 *
 * That last part is done in CSS (`motion-reduce:hidden`) rather than by leaving
 * the layers out of the JSX, and the distinction matters. The server cannot know
 * a visitor's motion preference, so it always prerenders the full set; a JS
 * `!reduce &&` guard then removed those nodes on the very first client render
 * and React threw a hydration mismatch, discarding and re-rendering the tree for
 * every reduced-motion visitor. A CSS media query decides after hydration, so
 * both sides agree on the markup. Don't convert these back to JSX conditionals.
 */
export function AmbientBackground() {
  const reduce = useReducedMotion();

  // Raw pointer position, then spring-smoothed so the light trails the cursor
  // instead of snapping to it.
  const px = useMotionValue(-500);
  const py = useMotionValue(-500);
  const sx = useSpring(px, { stiffness: 90, damping: 22, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 90, damping: 22, mass: 0.7 });

  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (reduce) return;
    function onMove(e: PointerEvent) {
      px.set(e.clientX);
      py.set(e.clientY);
      setActive(true);
    }
    function onLeave() {
      setActive(false);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce, px, py]);

  const spotlightMask = useMotionTemplate`radial-gradient(17rem circle at ${sx}px ${sy}px, #000 0%, rgba(0,0,0,0.6) 45%, transparent 74%)`;
  const glow = useMotionTemplate`radial-gradient(26rem circle at ${sx}px ${sy}px, color-mix(in oklab, var(--brand) 22%, transparent), transparent 66%)`;
  const halo = useMotionTemplate`radial-gradient(40rem circle at ${sx}px ${sy}px, color-mix(in oklab, var(--accent-2) 10%, transparent), transparent 70%)`;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* 1. drifting meshes */}
      <div className="bg-mesh animate-ambient-drift absolute -inset-[25%] opacity-70" />
      <div className="bg-mesh-alt animate-ambient-drift-slow absolute -inset-[30%] opacity-50" />

      {/* 2. scan band */}
      <div className="animate-scan-sweep via-brand/[0.07] absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent to-transparent motion-reduce:hidden">
        <div className="bg-brand/20 absolute inset-x-0 bottom-0 h-px" />
      </div>

      {/* 3. base dot grid */}
      <div className="bg-dot-grid absolute inset-0 opacity-40" />

      {/* 4. dots lit under the cursor. The pointer listener never attaches under
             reduced motion, so `active` stays false and this sits at opacity 0
             regardless; `motion-reduce:hidden` makes that explicit. */}
      <motion.div
        className="bg-dot-grid-lit absolute inset-0 transition-opacity duration-500 motion-reduce:hidden"
        style={{
          maskImage: spotlightMask,
          WebkitMaskImage: spotlightMask,
          opacity: active ? 1 : 0,
        }}
      />

      {/* 5. cursor glow — a wide accent halo under a tighter brand core, so
             the light has falloff instead of reading as a flat disc */}
      <motion.div
        className="absolute inset-0 transition-opacity duration-500 motion-reduce:hidden"
        style={{ backgroundImage: halo, opacity: active ? 1 : 0 }}
      />
      <motion.div
        className="absolute inset-0 transition-opacity duration-500 motion-reduce:hidden"
        style={{ backgroundImage: glow, opacity: active ? 1 : 0 }}
      />

      {/* 6. grain + contrast scrim */}
      <div className="bg-noise absolute inset-0 opacity-[0.035] dark:opacity-[0.05]" />
      <div className="from-background/70 via-background/25 to-background/70 absolute inset-0 bg-gradient-to-b" />
    </div>
  );
}

export default AmbientBackground;
