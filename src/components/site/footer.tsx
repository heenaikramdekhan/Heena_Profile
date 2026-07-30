'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionSafe } from './use-motion-preference';
import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { Reveal } from './section';
import { iconButtonClass } from './button-styles';

export function Footer() {
  const { personal, social } = getConfig();
  const reduce = useReducedMotionSafe();
  const year = new Date().getFullYear();

  const socials = [
    { label: 'GitHub', href: social.github, icon: Github },
    { label: 'LinkedIn', href: social.linkedin, icon: Linkedin },
    { label: 'Email', href: `mailto:${personal.email}`, icon: Mail },
  ];

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <footer className="relative">
      {/* gradient separator, replaces the flat border-t */}
      <div className="via-border h-px w-full bg-gradient-to-r from-transparent to-transparent" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Reveal>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              © {year} {personal.name}. Built with Next.js &amp; Tailwind CSS.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {socials.map(({ label, href, icon: Icon }) => (
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
              </div>

              {/* back to top */}
              <motion.button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                whileHover={reduce ? undefined : { y: -3 }}
                whileTap={reduce ? undefined : { scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="border-border text-muted-foreground hover:text-foreground hover:border-brand/40 hover:shadow-brand/10 inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors hover:shadow-md focus-visible:ring-brand/55 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                <ArrowUp className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

export default Footer;
