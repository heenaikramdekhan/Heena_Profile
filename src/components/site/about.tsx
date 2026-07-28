'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, GraduationCap, Sparkles, Check, Bug, Bot } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { Section, Reveal } from './section';

export function About() {
  const { personal, education } = getConfig();

  const facts = [
    { icon: MapPin, label: 'Based in', value: personal.location },
    {
      icon: GraduationCap,
      label: 'Education',
      value: `${education.current.degree}, NUST`,
    },
    {
      icon: Sparkles,
      label: 'Focus',
      value: 'QA · AI Quality · AI Engineering',
    },
  ];

  /* The two halves, stated plainly and side by side. Visitors who came for a
     QA hire and visitors who came for an AI hire should both find themselves
     in one of these two columns — and then read why the other one matters. */
  const sides = [
    {
      icon: Bug,
      kicker: 'The QA half',
      title: 'I find what’s broken',
      body: 'Exploratory and regression plans, API validation, model-based test design, and automated suites. I assume the app is guilty until proven innocent, and I file bugs nobody has to ask me to reproduce twice.',
      tone: 'brand' as const,
    },
    {
      icon: Bot,
      kicker: 'The AI half',
      title: 'I build what doesn’t',
      body: 'Multi-agent flows, RAG pipelines, and vector search backends in LangGraph and LangChain. I design them around their failure cases first, because I already know exactly how I’d attack them.',
      tone: 'accent2' as const,
    },
  ];

  return (
    <Section id="about" index="01" title="About">
      <div className="grid gap-10 md:grid-cols-5 md:gap-12">
        {/* Left: avatar + facts */}
        <Reveal className="md:col-span-2">
          <div className="border-border relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border">
            <Image
              src={personal.avatar}
              alt={personal.name}
              width={480}
              height={480}
              className="h-full w-full object-cover"
            />
          </div>

          <ul className="mt-6 space-y-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="border-border text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="text-muted-foreground block text-xs">
                    {label}
                  </span>
                  <span className="text-foreground text-sm font-medium">
                    {value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Right: bio + highlights */}
        <Reveal className="md:col-span-3" delay={0.1}>
          <p className="text-foreground text-lg leading-relaxed">
            {personal.bio}
          </p>

          {/* the two halves, and the line that joins them */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sides.map(({ icon: Icon, kicker, title, body, tone }) => (
              <div
                key={kicker}
                className={
                  'rounded-xl border p-5 ' +
                  (tone === 'brand'
                    ? 'border-brand/25 bg-brand/[0.04]'
                    : 'border-accent2/25 bg-accent2/[0.04]')
                }
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={
                      'flex h-8 w-8 items-center justify-center rounded-md ' +
                      (tone === 'brand'
                        ? 'bg-brand/10 text-brand'
                        : 'bg-accent2/10 text-accent2')
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={
                      'font-mono text-[10px] font-semibold tracking-widest uppercase ' +
                      (tone === 'brand' ? 'text-brand' : 'text-accent2')
                    }
                  >
                    {kicker}
                  </span>
                </div>
                <h3 className="text-foreground mt-3 text-base font-semibold">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <p className="border-border text-muted-foreground mt-4 border-l-2 pl-4 text-sm leading-relaxed italic">
            Neither half is a side project. QA taught me to think like the user
            who ignores every instruction; AI engineering taught me to build
            systems that survive that user anyway.
          </p>

          <div className="mt-8">
            <h3 className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase">
              Highlights
            </h3>
            <ul className="mt-4 space-y-3">
              {education.achievements.map((achievement) => (
                <li key={achievement} className="flex items-start gap-3">
                  <span className="bg-brand/10 text-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {achievement}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default About;
