import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getInternship } from './tools/getIntership';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const maxDuration = 30;

const KEY_PLACEHOLDER = 'your_google_ai_api_key_here';

/**
 * Gemini credentials.
 *
 * `GOOGLE_GENERATIVE_AI_API_KEY` is canonical, because that is the name the AI
 * SDK reads on its own. `GEMINI_API_KEY` is accepted too: it is the name Google
 * AI Studio puts in front of you, so it is the one that tends to get pasted
 * into a host's dashboard. The two names drifting apart is exactly what left
 * this widget silently offline once, and the fallback costs one line.
 */
/**
 * Trimmed on the way in, which is not paranoia: the key travels through a
 * dashboard paste or a shell pipe before it gets here, and a stray byte-order
 * mark or newline rides along easily. The provider puts this straight into an
 * `x-goog-api-key` header, and a header value has to be Latin-1, so one
 * invisible U+FEFF turns every reply into "Cannot convert argument to a
 * ByteString" with nothing on screen to explain it. `trim()` covers U+FEFF.
 */
const apiKey = [
  process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  process.env.GEMINI_API_KEY,
]
  .map((value) => value?.trim())
  .find((value) => value && value !== KEY_PLACEHOLDER);

/**
 * `gemini-2.5-flash` was the model here, and Google retired it for newly issued
 * API keys: the endpoint answers 404 "no longer available to new users" even
 * though ListModels still advertises it. The whole 2.x family is out of reach on
 * a new free key, since 2.0 answers 429 with an empty free-tier quota, so this
 * has to be a Gemini 3 model.
 *
 * Pinned to an exact id rather than a `-latest` alias, so Google moving that
 * alias cannot change how this route behaves without a commit.
 *
 * The lite tier is deliberate. Free-tier quota is metered per model per day,
 * and `gemini-3.6-flash` ran out its daily allowance inside a single testing
 * session, which for a public page means the widget dies by mid-morning. Lite
 * carries a far larger daily allowance and has nothing hard to do here: six
 * parameterless tools and a fixed persona.
 *
 * Gemini 3 will only accept a tool call replayed back to it with the
 * `thought_signature` it issued. That round-trip is why this route needs a
 * current @ai-sdk/google; the 1.x provider dropped the signature and every
 * multi-step tool call died with a 400.
 */
const MODEL = 'gemini-3.5-flash-lite';

const google = createGoogleGenerativeAI({ apiKey });

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

/** Map a raw provider error onto something worth showing a visitor. */
function visitorMessage(error: unknown) {
  const message = errorHandler(error);

  if (
    message.includes('quota') ||
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED')
  ) {
    return 'API quota exceeded. Please try again later or use preset questions.';
  }
  if (message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  return `Error: ${message}`;
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

    const { messages }: { messages: UIMessage[] } = await req.json();

    // Check if API key is available (never log the key itself)
    if (!apiKey) {
      // Diagnostics stay server-side. A visitor gets a plain apology instead of
      // a message about environment variables, which means nothing to them and
      // reads as a broken site.
      console.error(
        '[CHAT-API] No usable Gemini key: set GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY)',
      );
      return new Response(
        "The AI assistant is offline at the moment. Everything it would tell you is on the page itself, and the contact section is the fastest way to reach me directly.",
        { status: 503 },
      );
    }

    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getInternship,
    };

    const result = streamText({
      model: google(MODEL),
      // The persona is an `instructions` option now, not a system message.
      instructions: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools,
      // Let the model answer in prose after a tool returns, rather than
      // stopping on the tool result.
      stopWhen: isStepCount(10),
      /**
       * Gemini 3 thinks before answering by default, and left alone it spent
       * 95s on a two-step tool call here, well past this route's 30s ceiling.
       * This bot answers from a fixed config through a fixed set of six tools,
       * so it has little to deliberate about; 'low' keeps enough reasoning to
       * pick the right tool without the open-ended thinking budget.
       */
      providerOptions: {
        google: { thinkingConfig: { thinkingLevel: 'low' } },
      },
      onError: ({ error }) => {
        console.error('[CHAT-API] Stream error:', errorHandler(error));
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: visitorMessage,
      }),
    });
  } catch (error) {
    const errorMessage = errorHandler(error);
    console.error('[CHAT-API] Request failed:', errorMessage);

    if (
      errorMessage.includes('quota') ||
      errorMessage.includes('RESOURCE_EXHAUSTED')
    ) {
      return new Response('API quota exceeded. Please try again later.', {
        status: 429,
      });
    }

    if (errorMessage.includes('network')) {
      return new Response(
        'Network error. Please check your connection and try again.',
        { status: 503 },
      );
    }

    return new Response(`Internal Server Error: ${errorMessage}`, {
      status: 500,
    });
  }
}
