import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getInternship = tool({
  description: 'Provides comprehensive information about internship opportunities, career preferences, and professional availability for recruiters and HR professionals.',
  inputSchema: z.object({}),
  execute: async () => {
    const config = getConfig();
    
    return {
      availability: config.internship.availability,
      preferences: {
        roleTypes: config.internship.focusAreas,
        workMode: config.internship.preferredLocation,
        location: config.personal.location,
        startDate: config.internship.startDate,
        duration: config.internship.duration
      },
      experience: {
        internshipCompleted: config.experience.find(exp => exp.type === "Internship")?.company 
          ? `${config.experience.find(exp => exp.type === "Internship")?.position} at ${config.experience.find(exp => exp.type === "Internship")?.company} (${config.experience.find(exp => exp.type === "Internship")?.duration})`
          : "No formal internship completed yet",
        freelanceWork: config.experience.find(exp => exp.type === "Freelance")?.description || "",
        projectExperience: "Owns the quality gate for AI voice and CRM products in production, and builds multi-agent / RAG systems as an AI engineer"
      },
      skills: {
        technical: [
          ...config.skills.qa_engineering,
          ...config.skills.qa_process,
          ...config.skills.ai_quality,
          ...config.skills.ai_engineering,
          ...config.skills.test_automation,
          ...config.skills.languages_frameworks,
          ...config.skills.platforms_tools
        ],
        soft: [
          "Meticulous documentation", "Proactive bug triage", "Cross-team collaboration",
          "Clear reproduction steps", "Release-readiness judgement", "Adaptability"
        ]
      },
      achievements: config.education.achievements || [],
      lookingFor: {
        goals: config.internship.goals,
        workStyle: config.internship.workStyle,
        motivation: config.personality.motivation,
        interests: config.personality.interests
      },
      contact: {
        email: config.personal.email,
        linkedin: config.social.linkedin,
        github: config.social.github,
        portfolio: "This portfolio, where the QA work and the AI engineering work sit together"
      },
      personality: {
        traits: config.personality.traits,
        funFacts: config.personality.funFacts,
        workingStyle: config.personality.workingStyle
      },
      professionalMessage: "I'm open to full-time or contract work that sits between quality engineering and AI systems. That could be AI quality and LLM evaluation, agent and RAG red-teaming, QA automation, or AI engineering itself. The pitch is simple. Teams are shipping AI products faster than they can verify them, and I work both sides of that gap. I've owned the quality gate for a natural-language voice CRM and a live credit platform, and I build multi-agent and RAG systems myself, so I can break something and then fix it instead of just filing the ticket. What is your team building, and where does it worry you most?"
    };
  },
});
