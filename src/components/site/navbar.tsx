'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConfig } from '@/lib/config-loader';
import { ThemeToggle } from './theme-toggle';
import { primaryButtonClass } from './button-styles';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const config = getConfig();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState('');
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: highlight the nav link for the section currently in view.
  React.useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-border bg-background/80 border-b backdrop-blur-md'
          : 'border-b border-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a
          href="#home"
          className="group flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="bg-brand text-brand-foreground flex h-7 w-7 items-center justify-center rounded-md font-mono text-sm">
            H
          </span>
          <span className="hidden sm:inline">Heena</span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId={reduce ? undefined : 'nav-active'}
                    className="bg-brand absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={config.resume.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButtonClass('hidden px-3.5 py-2 sm:inline-flex')}
          >
            <FileDown className="h-4 w-4" />
            Resume
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="border-border text-muted-foreground hover:text-foreground hover:border-brand/40 relative inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors md:hidden"
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <motion.span
                animate={reduce ? undefined : { rotate: open ? 45 : 0, y: open ? 0 : -4 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-current absolute h-0.5 w-4 rounded-full"
                style={reduce ? { transform: open ? 'rotate(45deg)' : 'translateY(-4px)' } : undefined}
              />
              <motion.span
                animate={reduce ? undefined : { opacity: open ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="bg-current absolute h-0.5 w-4 rounded-full"
                style={reduce ? { opacity: open ? 0 : 1 } : undefined}
              />
              <motion.span
                animate={reduce ? undefined : { rotate: open ? -45 : 0, y: open ? 0 : 4 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-current absolute h-0.5 w-4 rounded-full"
                style={reduce ? { transform: open ? 'rotate(-45deg)' : 'translateY(4px)' } : undefined}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="border-border bg-background/95 overflow-hidden border-b backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-5xl flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={reduce ? undefined : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href={config.resume.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={primaryButtonClass('mt-2')}
              >
                <FileDown className="h-4 w-4" />
                Download Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
