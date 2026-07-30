'use client';

import React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from 'framer-motion';
import { useReducedMotionSafe } from './use-motion-preference';
import { ArrowUpRight, ChevronDown, Github, Linkedin, Mail, FileDown } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { primaryButtonClass, secondaryButtonClass, quietButtonClass, iconButtonClass } from './button-styles';
import { Ripple } from './ripple';

/* -------------------------------------------------------------------------- */
/*  Signature element: the same AI system seen through two lenses.            */
/*                                                                            */
/*  BUILD — the pipeline as shipped: input → retrieval → agent → tools →      */
/*          response, calm and connected.                                     */
/*  BREAK — the identical graph with each node's real failure mode exposed:   */
/*          prompt injection, empty recall, tool timeout, hallucination.      */
/*                                                                            */
/*  It auto-alternates until the visitor picks a side, then holds. That is    */
/*  the whole positioning in one object: one system, two ways of seeing it.   */
/*  SVG connectors behind, HTML chips in front for crisp themed text.         */
/*  Cursor drives a subtle 3D tilt; nodes sit at different depths (parallax). */
/*  Auto-cycling, tilt, and pulses are all disabled under reduced motion.     */
/* -------------------------------------------------------------------------- */

type Mode = 'build' | 'break';

type Node = {
  id: string;
  /** Label in BUILD view — the component as designed. */
  build: string;
  /** Label in BREAK view — how that component actually fails. */
  break: string;
  kind: 'core' | 'agent' | 'data';
  x: number;
  y: number;
};

const NODES: Node[] = [
  { id: 'core', build: 'Agent', break: 'Runaway loop', kind: 'core', x: 50, y: 50 },
  { id: 'input', build: 'User input', break: 'Prompt injection', kind: 'agent', x: 50, y: 9 },
  { id: 'retrieval', build: 'Retrieval', break: 'Empty recall', kind: 'data', x: 91, y: 37 },
  { id: 'tools', build: 'Tools', break: 'Tool timeout', kind: 'agent', x: 74, y: 90 },
  { id: 'memory', build: 'Memory', break: 'Stale state', kind: 'agent', x: 26, y: 90 },
  { id: 'output', build: 'Response', break: 'Hallucination', kind: 'data', x: 9, y: 37 },
];

const CORE = NODES[0];
const DEPTH: Record<Node['kind'], number> = { core: 46, agent: 26, data: 26 };

const CAPTION: Record<Mode, string> = {
  build: 'Build what doesn’t break',
  break: 'Break it before users do',
};

function SystemGraph() {
  const reduce = useReducedMotionSafe();
  const [mode, setMode] = React.useState<Mode>('build');
  // Once the visitor chooses a lens, stop cycling and respect the choice.
  const [pinned, setPinned] = React.useState(false);

  React.useEffect(() => {
    if (reduce || pinned) return;
    const id = setInterval(
      () => setMode((m) => (m === 'build' ? 'break' : 'build')),
      4200
    );
    return () => clearInterval(id);
  }, [reduce, pinned]);

  function choose(next: Mode) {
    setMode(next);
    setPinned(true);
  }

  const broken = mode === 'break';

  // normalized pointer offset from center, -0.5 … 0.5
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.4 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  const glowX = useTransform(sx, [-0.5, 0.5], ['32%', '68%']);
  const glowY = useTransform(sy, [-0.5, 0.5], ['32%', '68%']);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.div
      role="group"
      aria-label="An AI system shown two ways: as built, and as broken"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className="glass relative mx-auto aspect-square w-full max-w-[26rem] rounded-2xl p-4 [transform-style:preserve-3d]"
    >
      {/* pointer-following glow — shifts hue with the active lens */}
      {!reduce && (
        <motion.div
          className={
            'pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700 ' +
            (broken ? 'bg-rose-500/20' : 'bg-brand/20')
          }
          style={{ left: glowX, top: glowY }}
        />
      )}

      {/* lens toggle */}
      <div className="border-border bg-background/80 absolute top-3 right-3 z-10 flex gap-1 rounded-full border p-0.5 backdrop-blur-sm">
        {(['build', 'break'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => choose(m)}
            aria-pressed={mode === m}
            className={
              'rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors ' +
              (mode === m
                ? m === 'break'
                  ? 'bg-rose-500/15 text-rose-500'
                  : 'bg-brand/15 text-brand'
                : 'text-muted-foreground hover:text-foreground')
            }
          >
            {m}
          </button>
        ))}
      </div>

      {/* connectors */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {NODES.slice(1).map((n) => (
          <motion.line
            key={n.id}
            x1={CORE.x}
            y1={CORE.y}
            x2={n.x}
            y2={n.y}
            stroke={broken ? '#f43f5e' : 'var(--brand)'}
            strokeWidth={0.4}
            strokeDasharray={broken ? '1.2 3.4' : '2.5 2.5'}
            vectorEffect="non-scaling-stroke"
            opacity={broken ? 0.55 : 0.45}
            animate={reduce ? undefined : { strokeDashoffset: [0, -10] }}
            transition={
              reduce
                ? undefined
                : {
                    duration: broken ? 0.7 : 1.6,
                    repeat: Infinity,
                    ease: 'linear',
                  }
            }
          />
        ))}
      </svg>

      {/* nodes — each lifted on its own Z plane for parallax under tilt */}
      {NODES.map((n) => {
        const isCore = n.kind === 'core';
        const isData = n.kind === 'data';
        return (
          <div
            key={n.id}
            aria-hidden
            className="absolute"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              transform: `translate(-50%, -50%) translateZ(${reduce ? 0 : DEPTH[n.kind]}px)`,
            }}
          >
            <motion.span
              // remount on lens change so the chip re-plays its entrance
              key={mode}
              initial={reduce ? false : { opacity: 0.35, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium whitespace-nowrap backdrop-blur-sm ' +
                (broken
                  ? isCore
                    ? 'border-rose-500/50 bg-rose-500/15 text-rose-500 shadow-sm'
                    : 'border-rose-500/35 bg-rose-500/10 text-rose-500/90'
                  : isCore
                    ? 'border-brand/40 bg-brand/15 text-foreground shadow-sm'
                    : isData
                      ? 'border-accent2/40 bg-accent2/10 text-accent2'
                      : 'border-border bg-background/70 text-muted-foreground')
              }
            >
              <span
                className={
                  'inline-block h-1.5 w-1.5 rounded-full ' +
                  (broken
                    ? 'bg-rose-500'
                    : isCore
                      ? 'bg-brand'
                      : isData
                        ? 'bg-accent2'
                        : 'bg-muted-foreground/60') +
                  (reduce ? '' : ' animate-pulse-node')
                }
              />
              {broken ? n.break : n.build}
            </motion.span>
          </div>
        );
      })}

      {/* caption */}
      <span
        className={
          'absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest uppercase transition-colors duration-500 ' +
          (broken ? 'text-rose-500/80' : 'text-muted-foreground')
        }
      >
        {CAPTION[mode]}
      </span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

export function Hero() {
  const { personal, social, resume } = getConfig();
  const reduce = useReducedMotionSafe();

  // Whole-block parallax: the text column drifts a few px opposite the
  // cursor. Deliberately tiny (max ~6px) — this is a premium-feeling nudge,
  // not the tilt effect already carried by SystemGraph.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 60, damping: 20, mass: 0.6 });
  const spy = useSpring(py, { stiffness: 60, damping: 20, mass: 0.6 });
  const parallaxX = useTransform(spx, [-0.5, 0.5], [6, -6]);
  const parallaxY = useTransform(spy, [-0.5, 0.5], [4, -4]);

  function handleSectionMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleSectionLeave() {
    px.set(0);
    py.set(0);
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduce ? 0 : 0.07 },
    },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const iconLinks = [
    { label: 'GitHub', href: social.github, icon: Github },
    { label: 'LinkedIn', href: social.linkedin, icon: Linkedin },
    { label: 'Email', href: `mailto:${personal.email}`, icon: Mail },
  ];

  return (
    <section
      id="home"
      onPointerMove={handleSectionMove}
      onPointerLeave={handleSectionLeave}
      className="relative flex min-h-[92vh] items-center overflow-hidden"
    >
      {/* Background lives in AmbientBackground now, page-wide. Adding local
          mesh/noise/grid layers back here would double-stack them. */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-24 pb-12 lg:grid-cols-[1.05fr_0.95fr]"
      >
        {/* ---- left: positioning ---- */}
        <motion.div style={reduce ? undefined : { x: parallaxX, y: parallaxY }}>
          <motion.div variants={item}>
            <span className="border-border bg-background/60 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Open to QA · AI quality · AI engineering roles
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-hero text-foreground mt-6 font-semibold"
          >
            {personal.name}
          </motion.h1>

          <motion.p
            variants={item}
            className="text-muted-foreground mt-5 max-w-xl text-lg font-medium md:text-xl"
          >
            <span className="text-foreground">QA Engineer</span>
            <span className="text-muted-foreground/50 mx-2">×</span>
            <span className="text-brand">AI Engineer</span>
            <span className="mt-2 block">
              I break AI systems before your users do, then build the ones
              that don&apos;t break.
            </span>
          </motion.p>

          {/* quantified proof point above the fold */}
          {personal.proofPoint && (
            <motion.div
              variants={item}
              className="glass mt-6 max-w-xl rounded-xl p-4"
            >
              <span className="text-accent2 font-mono text-[10px] font-semibold tracking-widest uppercase">
                Right now
              </span>
              <p className="text-foreground/90 mt-1.5 text-sm leading-relaxed">
                {personal.proofPoint}
              </p>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Ripple tone="primary">
              <a href="#projects" className={primaryButtonClass()}>
                View my work
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Ripple>
            <Ripple tone="secondary">
              <a href="#contact" className={secondaryButtonClass()}>
                Get in touch
              </a>
            </Ripple>
            <a
              href={resume.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={quietButtonClass()}
            >
              <FileDown className="h-4 w-4" />
              Resume
            </a>
          </motion.div>

          {/* social row */}
          <motion.div variants={item} className="mt-8 flex items-center gap-2">
            {iconLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={iconButtonClass()}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            {social.liveProduct && (
              <a
                href={social.liveProduct}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButtonClass('ml-1 h-10 px-3 py-0')}
              >
                {social.liveProduct.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </motion.div>
        </motion.div>

        {/* ---- right: signature element (hidden on small screens, degrades gracefully) ---- */}
        <motion.div variants={item} className="hidden lg:block">
          <SystemGraph />
        </motion.div>
      </motion.div>

      {/* scroll indicator — fades out once the visitor starts scrolling */}
      {!reduce && (
        <motion.a
          href="#about"
          aria-label="Scroll to About section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-muted-foreground hover:text-foreground absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-1.5 transition-colors"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.a>
      )}
    </section>
  );
}

export default Hero;
