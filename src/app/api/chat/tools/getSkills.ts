import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getSkills = tool({
  description:
    'This tool provides a comprehensive overview of technical skills, expertise, and professional qualifications.',
  inputSchema: z.object({}),
  execute: async () => {
    const config = getConfig();
    
    return {
      technicalSkills: {
        qaEngineering: config.skills.qa_engineering,
        qaProcessAndMethodology: config.skills.qa_process,
        aiQualityAndEvaluation: config.skills.ai_quality,
        aiEngineering: config.skills.ai_engineering,
        testAutomation: config.skills.test_automation,
        languagesAndFrameworks: config.skills.languages_frameworks,
        platformsAndTools: config.skills.platforms_tools
      },
      certifications: config.certifications || [],
      education: {
        degree: config.education.current.degree,
        institution: config.education.current.institution,
        cgpa: config.education.current.cgpa,
        duration: config.education.current.duration
      },
      achievements: config.education.achievements || [],
      experience: config.experience.map(exp => ({
        position: exp.position,
        company: exp.company,
        duration: exp.duration,
        type: exp.type,
        technologies: exp.technologies,
        description: exp.description
      })),
      message: "My skill set sits in two halves that keep sharpening each other. On the QA side: manual, functional, regression, exploratory, API, mobile, and model-based testing, plus automation with Selenium WebDriver and Applitools. On the AI engineering side: LangGraph, LangChain, RAG pipelines, multi-agent systems, and vector search. The interesting part is where they overlap. Evaluating LLM systems that answer differently every time, adversarial and red-team probing, grounding and hallucination checks, and generating synthetic test data at a scale manual testing can't reach. Most QA engineers can't build an agent, and most AI engineers don't think adversarially about their own output. I do both. Which side would you like me to go deeper on?"
    };
  },
});
