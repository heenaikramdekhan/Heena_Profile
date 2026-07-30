import { systemPrompt } from '@/lib/config-loader';

/**
 * The grounded-assistant persona, built from portfolio-config.json at build time.
 *
 * Exported as a bare string rather than a `{ role: 'system' }` message: the AI
 * SDK rejects system messages inside the `messages` array now, and the prompt
 * belongs in `streamText`'s `instructions` option instead.
 */
export const SYSTEM_PROMPT = systemPrompt;
