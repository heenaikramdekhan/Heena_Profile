# Heena, Portfolio

Personal portfolio for **Heena**, Software QA Engineer and AI Engineer. She goes by the single name Heena, so don't add a surname anywhere in the copy. A content-first, statically prerendered single-page site with an optional AI assistant widget.

## Positioning



The site is built around one idea rather than two careers: quality engineering for AI systems. Heena tests AI adversarially and builds it, which is an unusual pairing. Most QA engineers can't build an agent, and most AI engineers don't think adversarially about their own output.

Everything on the page serves that idea:

- The **hero graphic** shows one AI pipeline through two lenses. `BUILD` is the system as shipped. `BREAK` relabels the same nodes with how they actually fail: prompt injection, empty recall, tool timeout, hallucination. It alternates on its own until the visitor picks a side.
- **About** puts the two halves next to each other, then the line that joins them.
- **Skills** has six groups, and `AI Quality & Evaluation` is marked as the intersection, because it only exists because she does both jobs.
- **Projects** mix QA case studies and AI builds instead of separating them.

Keep that spine when editing copy. Splitting the site into a QA section and an AI section is the specific outcome this design exists to avoid.

## Writing style

The copy deliberately avoids em dashes and the usual AI phrasing tics. If you edit anything, or regenerate content with a model, keep to that: commas, full stops and colons instead of dashes, varied sentence length, concrete detail over adjectives. The chatbot system prompt in `src/lib/config-parser.ts` carries the same rules so its generated answers match the written copy.

## Stack

Next.js 16 (App Router, React 19, Turbopack), TypeScript, Tailwind CSS 3.4, Framer Motion, Geist (Sans and Mono), Radix UI, next-themes, Vercel Analytics. The AI assistant runs on Google Gemini through the AI SDK, and the contact form sends through Resend.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000 (Turbopack)
npm run build    # production build, the main correctness gate
npm run start    # serve the production build
npx tsc --noEmit # typecheck (no test suite; tsc and build are the gates)
```

### Environment variables (`.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | for deployment | Canonical origin used by metadata, JSON-LD, `sitemap.ts` and `robots.ts`. Defaults to a Vercel preview host, so **set this before going live** or canonical URLs will point at the wrong origin. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | for the chat widget | Gemini key from [Google AI Studio](https://aistudio.google.com/). The static site renders fine without it. Only the assistant needs it. |
| `RESEND_API_KEY` | for the contact form | [Resend](https://resend.com) API key. Without it `/api/contact` returns a clean 503 and the form shows its "email me directly" fallback. |
| `CONTACT_TO_EMAIL` | optional | Where contact messages are delivered. Defaults to the address in `portfolio-config.json`. |
| `CONTACT_FROM_EMAIL` | optional | Verified Resend sender. Defaults to `onboarding@resend.dev` for testing. Point it at a verified domain in production. |

## Editing content

Almost all content lives in **`portfolio-config.json`** at the repo root: personal info, experience, projects with their case-study fields, skills, education, certifications, resume, and the chatbot persona. Edit the JSON. The site reads it through `src/lib/config-loader.ts` and `config-parser.ts`. See **[CLAUDE.md](CLAUDE.md)** for the architecture and for the set of files that have to change together when the config *shape* changes.

- **Profile photo:** `public/profile.jpeg`, a square crop. `public/avatar-placeholder.png` is the generated initial fallback if that file ever goes missing.
- **Resume:** replace `public/Heena-Resume.pdf`, which the config links to.
- **Social card:** generated at build time by `src/app/opengraph-image.tsx`, so there's no image file to maintain. Edit the JSX to change it.

## Deploy

Set up for **Vercel**: push to GitHub, import the repo, set the environment variables above (`NEXT_PUBLIC_SITE_URL` especially), and deploy. Security headers (CSP, HSTS, X-Frame-Options and the rest) are configured in `next.config.ts`.

## License

MIT, see [docs/LICENSE](docs/LICENSE). This is derived from an open-source portfolio template, and the earlier copyright notices are preserved there. Please leave them in place.
