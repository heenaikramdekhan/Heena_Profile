import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getInternship } from './tools/getIntership';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const maxDuration = 30;

// Create Google AI provider with explicit API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

function errorHandler(error: unknown) {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  try {
    // Throttle to control Gemini spend: 20 requests per minute per IP.
    const ip = getClientIp(req);
    const rl = rateLimit(`chat:${ip}`, 20, 60_000);
    if (!rl.ok) {
      return new Response(
        'You are sending messages too quickly. Please wait a moment and try again.',
        { status: 429 },
      );
    }

    const { messages } = await req.json();

    // Check if API key is available (never log the key itself)
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'your_google_ai_api_key_here') {
      // Diagnostics stay server-side. A visitor gets a plain apology instead of
      // a message about environment variables, which means nothing to them and
      // reads as a broken site.
      console.error('[CHAT-API] Missing or invalid GOOGLE_GENERATIVE_AI_API_KEY environment variable');
      return new Response(
        "The AI assistant is offline at the moment. Everything it would tell you is on the page itself, and the contact section is the fastest way to reach me directly.",
        { status: 503 },
      );
    }

    // Add system prompt
    messages.unshift(SYSTEM_PROMPT);

    // Add tools
    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getInternship,
    };

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages,
      tools,
      maxSteps: 10,
      onError: ({ error }) => {
        console.error('[CHAT-API] Stream error:', errorHandler(error));
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        const message = errorHandler(error);

        if (message.includes('quota') || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
          return 'API quota exceeded. Please try again later or use preset questions.';
        }
        if (message.includes('network')) {
          return 'Network error. Please check your connection and try again.';
        }
        return `Error: ${message}`;
      },
    });
  } catch (error) {
    const errorMessage = errorHandler(error);
    console.error('Chat API error:', errorMessage);
    console.error('Error details:', error);
    
    // Handle specific error types
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return new Response('API quota exceeded. Please try again later.', { status: 429 });
    }
    
    if (errorMessage.includes('network')) {
      return new Response('Network error. Please check your connection and try again.', { status: 503 });
    }
    
    return new Response(`Internal Server Error: ${errorMessage}`, { status: 500 });
  }
}
