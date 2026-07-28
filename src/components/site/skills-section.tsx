'use client';

import {
  Code2,
  Bot,
  Bug,
  ClipboardList,
  Crosshair,
  Workflow,
  Wrench,
} from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { Section, Reveal } from './section';
import { HoverLift } from './motion-primitives';
import { Tag, TagRow } from './tag';

export function SkillsSection() {
  const { skills } = getConfig();

  /**
   * Skills are separated into bands so a visitor hiring for one side can read
   * just that band. The order is deliberate: QA, then the overlap, then AI.
   * The overlap sits in the middle because it belongs to neither band alone.
   */
  const bands = [
    {
      band: 'The QA side',
      groups: [
        {
          label: 'QA & Testing',
          icon: Bug,
          items: skills.qa_engineering,
          evidence:
            'The quality gate for web and mobile releases at SageTeck, and 10,000+ users kept stable at RecruitBPM before that.',
          highlight: false,
        },
        {
          label: 'QA Process & Methodology',
          icon: ClipboardList,
          items: skills.qa_process,
          evidence:
            'How the testing actually gets run: requirements in, test cases designed, defects tracked to close, release verified.',
          highlight: false,
        },
        {
          label: 'Test Automation',
          icon: Workflow,
          items: skills.test_automation,
          evidence:
            'Regression suites that run without me, and visual AI that catches the layout breaks eyes skim past.',
          highlight: false,
        },
      ],
    },
    {
      band: 'Where the two meet',
      groups: [
        {
          label: 'AI Quality & Evaluation',
          icon: Crosshair,
          items: skills.ai_quality,
          evidence:
            'Testing systems that give a different answer every time, and proving the answer is actually grounded.',
          highlight: true,
        },
      ],
    },
    {
      band: 'The AI side',
      groups: [
        {
          label: 'AI Engineering',
          icon: Bot,
          items: skills.ai_engineering,
          evidence:
            'Multi-agent flows, RAG pipelines, and vector search backends built for production at SkilliHire.',
          highlight: false,
        },
      ],
    },
    {
      band: 'Shared foundation',
      groups: [
        {
          label: 'Languages & Frameworks',
          icon: Code2,
          items: skills.languages_frameworks,
          evidence:
            'What I write tests in, and what I build the systems under test in.',
          highlight: false,
        },
        {
          label: 'Platforms & Tools',
          icon: Wrench,
          items: skills.platforms_tools,
          evidence:
            'Where the bugs get tracked, the APIs get poked, and the releases get called.',
          highlight: false,
        },
      ],
    },
  ]
    .map((b) => ({
      ...b,
      groups: b.groups.filter((g) => g.items && g.items.length > 0),
    }))
    .filter((b) => b.groups.length > 0);

  return (
    <Section
      id="skills"
      index="04"
      title="Skills"
      description="Split by which side of the work they belong to. The middle band only exists because I do both jobs."
    >
      <div className="space-y-10">
        {bands.map((band) => (
          <div key={band.band}>
            <Reveal>
              <div className="mb-4 flex items-center gap-3">
                <h3
                  className={
                    'font-mono text-xs font-semibold tracking-widest uppercase ' +
                    (band.groups[0].highlight
                      ? 'text-accent2'
                      : 'text-muted-foreground')
                  }
                >
                  {band.band}
                </h3>
                <span
                  className={
                    'h-px flex-1 ' +
                    (band.groups[0].highlight
                      ? 'bg-accent2/25'
                      : 'bg-border')
                  }
                />
              </div>
            </Reveal>

            {/* a lone card in a 2-col grid reads as a gap, so let it span */}
            <div
              className={
                'grid gap-5 ' +
                (band.groups.length === 1
                  ? ''
                  : band.groups.length === 2
                    ? 'sm:grid-cols-2'
                    : 'sm:grid-cols-2 lg:grid-cols-3')
              }
            >
              {band.groups.map((group, i) => (
                <Reveal key={group.label} delay={i * 0.04}>
                  <HoverLift y={-3} className="h-full">
                  <div
              className={
                'card-glow-border h-full rounded-xl border p-5 transition-[box-shadow] duration-300 hover:shadow-lg ' +
                (group.highlight
                  ? 'border-accent2/40 bg-accent2/[0.04] hover:shadow-accent2/10'
                  : 'border-border bg-card hover:shadow-brand/10')
              }
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={
                    'flex h-8 w-8 items-center justify-center rounded-md ' +
                    (group.highlight
                      ? 'bg-accent2/15 text-accent2'
                      : 'bg-brand/10 text-brand')
                  }
                >
                  <group.icon className="h-4 w-4" />
                </span>
                <h3 className="text-foreground text-sm font-semibold">
                  {group.label}
                </h3>
                {group.highlight && (
                  <span className="text-accent2 border-accent2/30 ml-auto rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold tracking-widest uppercase">
                    Intersection
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mt-3 text-[13px] leading-relaxed">
                {group.evidence}
              </p>

              {/* The intersection card carries the accent tone, so its tags
                  read as the differentiator rather than more of the same. */}
              <TagRow className="mt-4">
                {group.items.map((skill) => (
                  <Tag key={skill} tone={group.highlight ? 'accent' : 'default'}>
                    {skill}
                  </Tag>
                ))}
              </TagRow>
                  </div>
                  </HoverLift>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>

    </Section>
  );
}

export default SkillsSection;
