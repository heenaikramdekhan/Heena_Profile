'use client';

import { useState } from 'react';
import { ArrowUpRight, Github, Globe } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import type { Discipline, Metric, Project, ProjectLink } from '@/types/portfolio';
import { Section, Reveal } from './section';
import { HoverLift } from './motion-primitives';

type Filter = 'all' | 'qa' | 'ai';

/** A project shows under a filter if it is that discipline, or both. */
function matches(project: Project, filter: Filter) {
  if (filter === 'all') return true;
  const d = project.discipline ?? 'other';
  return d === filter || d === 'both';
}

/**
 * Small QA / AI chips. Projects tagged `both` show both chips on purpose:
 * that overlap is the point of the portfolio, not an edge case to hide.
 */
function DisciplineTag({ discipline }: { discipline?: Discipline }) {
  if (!discipline || discipline === 'other') return null;
  const chips: Array<{ label: string; tone: 'qa' | 'ai' }> =
    discipline === 'both'
      ? [
          { label: 'QA', tone: 'qa' },
          { label: 'AI', tone: 'ai' },
        ]
      : [
          {
            label: discipline === 'qa' ? 'QA' : 'AI',
            tone: discipline === 'qa' ? 'qa' : 'ai',
          },
        ];

  return (
    <span className="flex shrink-0 items-center gap-1">
      {chips.map(({ label, tone }) => (
        <span
          key={label}
          className={
            'rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-widest uppercase ' +
            (tone === 'qa'
              ? 'border-brand/35 text-brand'
              : 'border-accent2/35 text-accent2')
          }
        >
          {label}
        </span>
      ))}
    </span>
  );
}

function initials(title: string) {
  const cleaned = title.split('—')[0].split('·')[0].trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  return (words[0]?.[0] ?? '') + (words[1]?.[0] ?? '');
}

function LinkButton({ link }: { link: ProjectLink }) {
  const isLive = /live|demo|product/i.test(link.name);
  const Icon = isLive ? Globe : Github;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
      {link.name}
      <ArrowUpRight className="h-3 w-3" />
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const live = status === 'Live';
  const ongoing = status === 'Ongoing';
  return (
    <span
      className={
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ' +
        (live
          ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
          : ongoing
            ? 'bg-brand/12 text-brand'
            : 'bg-muted text-muted-foreground')
      }
    >
      {(live || ongoing) && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {status}
    </span>
  );
}

function StatBlock({ metric }: { metric: Metric }) {
  return (
    <div className="border-border bg-background/50 rounded-lg border px-3 py-2">
      <div className="text-accent2 font-mono text-sm font-semibold">
        {metric.value}
      </div>
      <div className="text-muted-foreground mt-0.5 text-[11px] leading-tight">
        {metric.label}
      </div>
    </div>
  );
}

function CaseStudyCard({ project }: { project: Project }) {
  const cs = project.caseStudy;
  const rows: Array<[string, string]> = cs
    ? [
        ['Problem', cs.problem],
        ['Approach', cs.approach],
        ['My role', cs.role],
        ['Impact', cs.impact],
      ]
    : [];

  return (
    <div className="group border-border bg-card hover:border-brand/40 hover:shadow-brand/10 overflow-hidden rounded-2xl border transition-[color,box-shadow,border-color] duration-300 hover:shadow-xl">
      {/* header band */}
      <div className="border-border from-brand/15 relative border-b bg-gradient-to-br to-transparent p-6 md:p-8">
        <div className="bg-dot-grid mask-radial-faded absolute inset-0 opacity-30" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="glass text-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-mono text-lg font-semibold">
              {initials(project.title)}
            </span>
            <div>
              <span className="text-muted-foreground font-mono text-[11px] tracking-wide uppercase">
                {project.category}
              </span>
              <h3 className="text-foreground mt-1 text-xl font-semibold tracking-tight">
                {project.title}
              </h3>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <StatusBadge status={project.status} />
            <DisciplineTag discipline={project.discipline} />
          </div>
        </div>

        {project.metrics && project.metrics.length > 0 && (
          <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {project.metrics.map((m) => (
              <StatBlock key={m.label} metric={m} />
            ))}
          </div>
        )}
      </div>

      {/* narrative */}
      <div className="p-6 md:p-8">
        {rows.length > 0 ? (
          <dl className="space-y-4">
            {rows.map(([label, text]) => (
              <div
                key={label}
                className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4"
              >
                <dt className="text-brand font-mono text-[11px] font-semibold tracking-widest uppercase sm:pt-0.5">
                  {label}
                </dt>
                <dd className="text-muted-foreground text-sm leading-relaxed">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="border-border mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
          {project.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.links.map((link) => (
                <LinkButton key={link.url} link={link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const { projects } = getConfig();
  const [filter, setFilter] = useState<Filter>('all');

  const tabs: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'qa', label: 'QA & Testing' },
    { key: 'ai', label: 'AI Engineering' },
  ];
  const countFor = (key: Filter) =>
    projects.filter((p) => matches(p, key)).length;

  // Every project renders as a full card. CaseStudyCard falls back to the
  // plain description when a project has no caseStudy block, so the shorter
  // entries still get the same treatment instead of a demoted grid tile.
  const visible = projects.filter((p) => matches(p, filter));

  return (
    <Section
      id="projects"
      index="03"
      title="Selected Work"
      description="Filter by the side of the work you're hiring for. QA work and AI builds, tagged so you can go straight to the half you care about."
    >
      {/* discipline filter */}
      <Reveal>
        <div
          role="tablist"
          aria-label="Filter projects by discipline"
          className="border-border bg-card mb-8 inline-flex flex-wrap gap-1 rounded-full border p-1"
        >
          {tabs.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={
                  'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ' +
                  (active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                {label}
                <span
                  className={
                    'ml-1.5 font-mono text-[10px] ' +
                    (active ? 'opacity-60' : 'opacity-50')
                  }
                >
                  {countFor(key)}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {visible.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Nothing tagged for this view yet.
        </p>
      )}

      <div className="space-y-6">
        {visible.map((project, i) => (
          <Reveal key={`${filter}-${project.title}`} delay={i * 0.05}>
            <HoverLift y={-3}>
              <CaseStudyCard project={project} />
            </HoverLift>
          </Reveal>
        ))}
      </div>

    </Section>
  );
}

export default Projects;
