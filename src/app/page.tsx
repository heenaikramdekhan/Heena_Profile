import { Navbar } from '@/components/site/navbar';
import { AmbientBackground } from '@/components/site/ambient-background';
import { Hero } from '@/components/site/hero';
import { About } from '@/components/site/about';
import { Experience } from '@/components/site/experience';
import { Projects } from '@/components/site/projects';
import { SkillsSection } from '@/components/site/skills-section';
import { Certifications } from '@/components/site/certifications';
import { ContactSection } from '@/components/site/contact-section';
import { Footer } from '@/components/site/footer';
import { AIChatWidget } from '@/components/site/ai-chat-widget';

export default function Home() {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <SkillsSection />
        <Certifications />
        <ContactSection />
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
