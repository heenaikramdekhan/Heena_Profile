export interface PersonalInfo {
  name: string;
  /** Optional — omitted when not published on the profile. */
  age?: number;
  location: string;
  title: string;
  tagline: string;
  /** One quantified, above-the-fold proof point for the hero. Real numbers / scope only. */
  proofPoint?: string;
  email: string;
  phone?: string;
  handle: string;
  bio: string;
  avatar: string;
  fallbackAvatar: string;
}

export interface Education {
  current: {
    degree: string;
    institution: string;
    duration: string;
    cgpa: string;
    graduationDate: string;
  };
  previous?: {
    degree: string;
    institution: string;
    duration: string;
    percentage?: string;
    completionDate?: string;
  };
  achievements: string[];
}

export interface Experience {
  company: string;
  position: string;
  type: string;
  duration: string;
  description: string;
  technologies: string[];
}

/**
 * Seven fixed category keys, ordered to lead with the QA × AI intersection.
 * These key names are hardcoded across config-parser, the chat tools, and the
 * skills renderers — change them in all of those together.
 *
 * `qa_engineering` holds test *types*; `qa_process` holds the lifecycle and
 * methodology competencies. Keeping them apart stops one card growing into an
 * unreadable wall of tags.
 */
export interface Skills {
  qa_engineering: string[];
  qa_process: string[];
  ai_quality: string[];
  ai_engineering: string[];
  test_automation: string[];
  languages_frameworks: string[];
  platforms_tools: string[];
}

/**
 * A certificate. Only `name` and `kind` are required so Heena can paste a
 * title in first and fill the rest later; every optional field is rendered
 * conditionally. `url` should be the issuer's verify/credential link, which
 * is what makes a Coursera-style certificate checkable rather than a claim.
 */
export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
  /**
   * Path to a scan of the certificate under `public/certificates/`.
   * Roughly 4:3 landscape is what the card is designed around. Cards without
   * one fall back to a text-only layout, so a missing scan never looks broken.
   */
  image?: string;
  /**
   * Component courses, for a specialization/programme certificate. Lets the
   * parent credential absorb its children instead of listing a course as a
   * peer of the specialization that contains it, which reads as padding.
   */
  includes?: string[];
  /**
   * Optional organisation mark, e.g. `/logos/akdn.png`. Square works best.
   * Shown as a small chip beside the title. When it is absent the card falls
   * back to a monogram built from the issuer, so an entry with neither a scan
   * nor a logo still has some visual identity instead of being bare text.
   * Volunteering roles often have no certificate at all, which is what this is
   * for.
   */
  logo?: string;
  kind: 'technical' | 'volunteering';
}

export interface ProjectLink {
  name: string;
  url: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
}

/** A single stat block. Real numbers or concrete scope only — never invented percentages. */
export interface Metric {
  label: string;
  value: string;
}

/** Structured case-study narrative for featured projects: problem → approach → role → impact. */
export interface CaseStudy {
  problem: string;
  approach: string;
  role: string;
  impact: string;
}

/**
 * Which side of Heena's work a project belongs to, used by the Projects
 * filter. `both` is the important one: TalkerCRM is genuinely QA *and* AI,
 * and forcing it into one bucket throws away the best evidence on the site.
 * `other` shows only under "All".
 */
export type Discipline = 'qa' | 'ai' | 'both' | 'other';

export interface Project {
  title: string;
  category: string;
  discipline?: Discipline;
  description: string;
  techStack: string[];
  date: string;
  status: string;
  featured: boolean;
  caseStudy?: CaseStudy;
  achievements?: string[];
  metrics?: Metric[];
  links: ProjectLink[];
  images: ProjectImage[];
}

export interface Social {
  linkedin: string;
  github: string;
  twitter: string;
  leetcode: string;
  liveProduct?: string;
  portfolio?: string;
}

export interface Internship {
  seeking: boolean;
  duration: string;
  startDate: string;
  preferredLocation: string;
  focusAreas: string[];
  availability: string;
  workStyle: string;
  goals: string;
}

export interface Personality {
  traits: string[];
  interests: string[];
  funFacts: string[];
  workingStyle: string;
  motivation: string;
}

export interface Resume {
  title: string;
  description: string;
  fileType: string;
  lastUpdated: string;
  fileSize: string;
  downloadUrl: string;
}

export interface Chatbot {
  name: string;
  personality: string;
  tone: string;
  language: string;
  responseStyle: string;
  useEmojis: boolean;
  topics: string[];
}

export interface PresetQuestions {
  me: string[];
  professional: string[];
  projects: string[];
  contact: string[];
  fun: string[];
}

export interface Meta {
  configVersion: string;
  lastUpdated: string;
  generatedBy: string;
  description: string;
}

export interface PortfolioConfig {
  personal: PersonalInfo;
  education: Education;
  certifications?: Certification[];
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  social: Social;
  internship: Internship;
  personality: Personality;
  resume: Resume;
  chatbot: Chatbot;
  presetQuestions: PresetQuestions;
  meta: Meta;
}

// Utility types for component props
export interface ProjectContentProps {
  project: {
    title: string;
  };
}

export interface ContactInfo {
  name: string;
  email: string;
  handle: string;
  socials: Array<{
    name: string;
    url: string;
  }>;
}

export interface ProfileInfo {
  name: string;
  title: string;
  tagline: string;
  age: string;
  location: string;
  description: string;
  src: string;
  fallbackSrc: string;
}

export interface SkillCategory {
  category: string;
  icon: React.ReactNode;
  skills: string[];
  color: string;
}
