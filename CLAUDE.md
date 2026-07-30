# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Heena's personal portfolio (she goes by the single name Heena, so don't append a surname anywhere) — a Next.js 16 (App Router, React 19, TypeScript, Tailwind 3.4) single-page site. Nearly all content is data-driven from a single JSON file; the homepage is statically prerendered content-first, with an AI chatbot (Gemini) offered as an optional floating widget.

### The positioning constraint (read before editing any copy)

Heena is a Software QA Engineer at SageTeck **and** an AI Engineer at SkilliHire — concurrently. The site deliberately presents this as **one** specialty (quality engineering for AI systems), never as two parallel careers. The load-bearing pieces:

- `hero.tsx` → `SystemGraph`: one AI pipeline, two lenses. `BUILD` shows the nodes as designed (`User input`, `Retrieval`, `Agent`, `Tools`, `Memory`, `Response`); `BREAK` relabels the same nodes with their failure modes (`Prompt injection`, `Empty recall`, `Runaway loop`, `Tool timeout`, `Stale state`, `Hallucination`). Auto-alternates every 4.2s until the visitor clicks a lens, then pins. Disabled under reduced motion.
- `about.tsx` → the `sides` array: "I find what's broken" / "I build what doesn't", followed by the italic line that joins them.
- `skills-section.tsx` → the `ai_quality` group carries `highlight: true` and an "Intersection" badge. That group is the differentiator; don't demote it.
- The chatbot system prompt in `config-parser.ts` has a dedicated "The one thing to get right" section instructing the model never to frame the dual role as an unresolved career choice.

Do not reorganise the site into a QA half and an AI half. That is the specific failure mode this design exists to avoid.

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build — run this to verify changes compile & prerender
npm run start    # serve the production build
npm run lint     # eslint (next lint)
npx tsc --noEmit # typecheck without emitting — the primary correctness gate
```

There is no test suite. **Verify any change with `npx tsc --noEmit` then `npm run build`** (build catches prerender/RSC boundary errors that tsc misses).

### Environment (`.env.local`)

- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini key for the chat widget. Static site renders fine without it; only the chatbot fails. `GEMINI_API_KEY` is accepted as a fallback, because that is the name Google AI Studio shows and it is what tends to get pasted into a host dashboard; the route checks the canonical name first. Both names being live is deliberate, so don't "clean up" the fallback.
- `RESEND_API_KEY` — for `/api/contact`. Without it the route returns 503 and the form shows its fallback; nothing else breaks.
- `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` — optional overrides for contact delivery (sensible defaults baked in).

All API keys are read server-side only and **never logged**.

## Architecture

### Content is config-driven — edit JSON, not JSX

`portfolio-config.json` (repo root) is the **single source of truth** for all content (personal info, experience, skills, projects, education, certifications, social links, resume, chatbot persona, preset questions). The data flow:

```
portfolio-config.json
  → src/lib/config-loader.ts   (require()s the JSON; has a fallback config if load fails;
                                 exports getConfig() + pre-parsed getters)
  → src/lib/config-parser.ts   (ConfigParser: builds the AI system prompt + generate*() shapers)
  → consumed by site sections, chat tools, and the API route
```

`config-loader.ts` exports both `getConfig()` (raw config) and pre-computed values (`systemPrompt`, `skillsData`, `projectData`, `contactInfo`, etc.). The AI **system prompt is generated at build time** from the config by `ConfigParser.generateSystemPrompt()` — it frames the bot as a *grounded portfolio assistant* (answers only from the config, refuses to fabricate credentials/metrics, off-topic, or adversarial role-play) and instructs it to always call tools.

Featured projects carry structured **case-study fields** on the `Project` type (`caseStudy: { problem, approach, role, impact }` + `metrics: {label, value}[]`), rendered as full case studies by `site/projects.tsx`; non-featured projects fall back to a compact "More work" card. `personal.proofPoint` is the hero's above-the-fold quantified proof.

**When changing the shape of `skills` / `personal` / `social` / `projects`, update all of these together** or the build breaks:
1. `portfolio-config.json` (the data)
2. `src/types/portfolio.ts` (the `PortfolioConfig` interface — the type contract)
3. `src/lib/config-parser.ts` (system-prompt string + the relevant `generate*()` method)
4. `src/lib/config-loader.ts` fallback config (must satisfy the same interface)
5. The `src/components/site/*` section that renders it
6. The chat tools in `src/app/api/chat/tools/*.ts` and their renderers (`src/components/skills.tsx`, `presentation.tsx`, etc.)

Note: `skills` uses seven fixed category keys — `qa_engineering`, `qa_process`, `ai_quality`, `ai_engineering`, `test_automation`, `languages_frameworks`, `platforms_tools`. These key names are hardcoded across the parser, tools, and both renderers, not derived dynamically. Adding or renaming one means touching all six files listed above. `qa_engineering` is test *types*; `qa_process` is lifecycle/methodology (STLC, Agile Scrum, defect lifecycle). Keep that split so neither card becomes a wall of tags.

`Project.discipline` (`'qa' | 'ai' | 'both' | 'other'`) drives the Projects filter tabs. `other` shows only under "All"; a project with no `discipline` is treated as `other`. The `both` value is supported but currently unused — Heena reviewed the tagging herself and decided TalkerCRM is `qa` only (she did QA there, not the build) and evidence-rag is `ai` only. Do not "helpfully" retag either back to `both`.

Every project renders through `CaseStudyCard`, including ones with no `caseStudy` block, which fall back to the plain description. Heena asked for this explicitly: there is no compact "More work" grid any more, so don't reintroduce one to shorten the page.

`personal.age` and `education.current.cgpa` are optional/blank and are rendered conditionally — don't reintroduce them as required fields or invent values to fill them.

`certifications` is `Certification[]`, **not** `string[]` (it was migrated). Only `name` and `kind` (`'technical' | 'volunteering'`) are required; `issuer`, `date`, `url`, and `image` render conditionally, and a `url` turns the card into a link to the issuer's verify page. Coursera renders a certificate image for every credential at
`https://s3.amazonaws.com/coursera_assets/meta_images/generated/CERTIFICATE_LANDING_PAGE/CERTIFICATE_LANDING_PAGE~<CODE>/CERTIFICATE_LANDING_PAGE~<CODE>.jpeg`
(1772x928, `<CODE>` = the verify code). Udemy works the same way at
`https://udemy-certificate.s3.amazonaws.com/image/<UC-xxxx>.jpg`
(1600x1190, `<UC-xxxx>` = the certificate number in the share URL). Both are plain S3 and are **not** behind the bot protection their parent sites use, so a verify or certificate URL is enough for either — no need to ask Heena to download anything.

Bright Network is the exception: it renders the certificate in HTML rather than serving a file, and the page sits behind a Cloudflare interstitial, so that scan had to come from Heena's own browser. Every card currently has a scan; if a new credential can't be sourced this way, ask for the image rather than shipping a text-only card, since the section now reads as uniform.

Scans live in `public/certificates/` and are shown with `object-contain` in a fixed `aspect-[16/10]` panel — **not** `object-cover`, because the set mixes landscape and portrait and cropping someone's certificate looks careless.

Every scan is normalised to the panel's exact **16:10** before it lands in `public/certificates/`: composited onto a 1600x1000 white canvas, scaled to fit 94% of it, centred. Sources arrive at anything from 0.73 to 1.91, and `object-contain` fit each differently inside the fixed panel, which made the certificates look randomly scaled even though the panels matched. Normalise new scans the same way rather than adjusting the panel.

The band layout is a **3-up grid** (`sm:grid-cols-2 lg:grid-cols-3`) with `h-full` cards, so rows line up under each other. This **reverses** an earlier multi-column/masonry decision, and the reason it reversed matters: masonry was chosen because card heights varied by roughly 4x between a scan and a name-only entry, and a grid left dead gaps. That variance is gone. Scans are now uniform 16:10, and `MediaPanel` gives *every* card a media band of identical height, falling back to the organisation logo and then to a monogram. Note this is not the "reserve an empty panel to equalise rows" idea Heena rejected: the panel is never empty, it always carries the strongest mark the entry has. Don't revert to `columns-*` — Heena asked for aligned rows directly.

Each band shows `INITIAL_VISIBLE` (6) cards with a "Show N more" toggle, so the section stays scannable as the list grows. The count beside the band heading is `aria-live="polite"` so the change is announced. It has its own section (`site/certifications.tsx`, index `05`) rather than a card inside Skills. A `kind` group with no entries is dropped, so the volunteering band stays hidden until it has content, and the whole section returns `null` if there are none at all. Several seeded issuers are deliberately blank because they weren't stated on Heena's LinkedIn — leave them empty rather than guessing which platform issued them.

Section indices are positional and hand-written (`about` 01 → `contact` 06). Inserting a section means renumbering the ones after it.

### Two UI layers: static site + chat widget

- **`src/components/site/*`** — the real portfolio. `page.tsx` composes `Navbar → Hero, About, Experience, Projects, SkillsSection, ContactSection → Footer → AIChatWidget`. Each section reads straight from `getConfig()`. `section.tsx` exports the shared `Section` wrapper + `Reveal` scroll-animation helper; `motion-primitives.tsx` exports `Magnetic` + `HoverLift`. This layer must stay statically prerenderable (keep it a Server Component where possible; `"use client"` only where interaction requires it). **All motion is reduced-motion aware** — `Reveal`, `Magnetic`, `HoverLift`, and the Hero graph each check the motion preference, backed by a global `prefers-reduced-motion` CSS net.

**Read the preference through `useReducedMotionSafe()` (`site/use-motion-preference.ts`), never framer-motion's `useReducedMotion` directly.** Framer's hook reads `matchMedia` during the *first* client render, and the server cannot know the preference, so it always prerenders the animated branch. Any component that branches on the raw hook renders one thing on the server and another on hydration, which React treats as a hydration failure: it discards the server tree and re-renders the whole page on the client for every visitor with the preference set. It surfaced as a single React #418 error, because React reports only the first mismatch and then bails, which hid that a dozen components were diverging. `useReducedMotionSafe` returns `false` until after mount so both renders agree, then reports the real value; reduced-motion visitors never see the one intervening frame move, because the CSS net flattens durations from the first paint.

`ambient-background.tsx` is the deliberate exception: it gates its animated layers with `motion-reduce:hidden` in CSS and only consults the preference inside an effect, so its markup is identical on both sides by construction. Don't convert those layers back to `{!reduce && ...}`.
- **`src/components/chat/*` + `src/components/site/ai-chat-widget.tsx`** — the AI chatbot, now a floating "Ask my AI" launcher opening a full-screen overlay. It is a bonus feature, not the primary entry point. The chat tool result renderers live at `src/components/{skills,presentation,contact,resume,AvailabilityCard}.tsx` and `src/components/projects/*`.

### API routes (`src/app/api/*`)

- **`chat/route.ts`** (`POST`, `maxDuration = 30`) streams from **`gemini-3.5-flash-lite`** via the AI SDK with a fixed tool set: `getProjects, getPresentation, getResume, getContact, getSkills, getInternship` (in `chat/tools/`). Each tool is an `ai` SDK `tool()` with an `inputSchema` reading from `getConfig()`, returning structured data the client renders with a matching component. The persona goes in `streamText`'s `instructions` option, **not** as a `{ role: 'system' }` message, which the SDK now rejects inside `messages`. Rate-limited 20/min per IP.

#### The model and SDK version are load-bearing together (read before touching either)

Three separate constraints pin this, and they were each found the hard way:

1. **Gemini 2.x is unreachable on a new key.** `gemini-2.5-flash` and `-flash-lite` answer **404** "no longer available to new users" — `ListModels` still advertises them, so only an actual call reveals it. The whole 2.0 family and `gemini-2.5-pro` answer **429** with empty `FreeTier` quota values. So this has to be a Gemini 3 model. Don't "restore" 2.5-flash.
2. **Gemini 3 tool calls require `thought_signature` round-tripping.** The model returns a signature alongside each `functionCall`, and replaying that call back without it is a hard **400 INVALID_ARGUMENT**, which kills every multi-step tool call, i.e. every real answer. `@ai-sdk/google@1.x` drops the signature and **that line is frozen at 1.2.22**, so there is no patch — the current provider is a requirement, not a nicety. Recent patches also cover *parallel* unsigned calls, which is the specific shape that failed here.
3. **Free quota is per model per day.** `gemini-3.6-flash` burned its entire daily allowance inside one testing session, which on a public page means the widget dies by mid-morning. The lite tier has a far larger allowance and has nothing hard to do here: six parameterless tools and a fixed persona. `thinkingLevel: 'low'` is set for the same reason — left to think freely, Gemini 3 spent **95s** on one two-step answer, past the 30s `maxDuration`.

Quota exhaustion is handled honestly rather than hidden: the client shows an amber "API Quota Exhausted" card pointing at the preset questions and the contact section.
- **`contact/route.ts`** (Node runtime) validates + honeypot-checks the contact form, delivers via **Resend**, rate-limited 5/min per IP, degrades to 503 if `RESEND_API_KEY` is unset. Logs are **PII-safe** (masked IP + outcome only — never name/email/message).
- **`src/lib/rate-limit.ts`** — shared in-memory fixed-window limiter (`rateLimit`, `getClientIp`, `maskIp`). Per-instance / resets on cold start; fine for a personal site. Swap the `Map` for Upstash Redis behind the same API if global accuracy is ever needed.

Security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) are set in `next.config.ts`. The CSP uses `'unsafe-inline'` (required by Next hydration + JSON-LD + Tailwind) and scopes `'unsafe-eval'` to dev only.

### Theming

Vercel/Linear-minimal aesthetic. Dark mode is default (`next-themes`, `attribute="class"`, `defaultTheme="dark"`). Colors are oklch tokens in `src/app/globals.css`: `--brand` (indigo-violet, Tailwind `brand`) is the primary accent and `--accent-2` (cyan-teal, Tailwind `accent2`) is the secondary, reserved for metrics/data. Fonts: **Geist Sans** (`--font-sans`) + **Geist Mono** (`--font-mono`), wired in `layout.tsx` + `tailwind.config.ts`. Signature utilities in `globals.css`: `.text-hero` (fluid display), `.bg-mesh`, `.bg-noise`, `.glass`.

Dark-mode surfaces were deliberately lifted off near-black after Heena reported she could barely read the text: `--background` 0.141 → 0.168, `--card` 0.21 → 0.238 (cards were nearly invisible against the page), `--muted`/`--secondary`/`--accent` 0.274 → 0.30, `--muted-foreground` 0.705 → 0.785, and `--border` 10% → 15%. Don't push these back toward black for "contrast" — the contrast problem was the *surfaces*, not the text colour.

`site/ambient-background.tsx` renders the whole page background **once, fixed** (`-z-10`). These layers used to be local to the hero, which left every section below it on flat near-black. The hero no longer carries its own copies; re-adding them double-stacks the effect. Layers back to front: two gradient meshes drifting on **32s and 47s** (deliberately non-dividing periods, so the loop never visibly repeats), a 17s scan band, the base dot grid, a brighter dot grid revealed through a cursor-following mask, an accent halo + brand core glow under the cursor, grain, then a scrim that protects text contrast over the mesh.

Cursor tracking uses motion values + springs only, so pointer movement never triggers a React re-render. Everything moving or interactive is behind `!reduce`.

Screenshotting this page: `Page.captureScreenshot` with `captureBeyondViewport: true` **deadlocks** here, because it waits for a stable frame and the ambient layers animate forever. Either emulate `prefers-reduced-motion` (the global CSS net drops animation durations to ~0) or take a plain viewport capture.

**Use theme tokens, never hardcoded colors** (`bg-background`, `text-muted-foreground`, `text-brand`, `text-accent2`, `bg-card`, etc. — not `bg-white` / `text-gray-*` / hex values) so light and dark both hold. `globals.css` keeps `!important` only for the sanctioned `prefers-reduced-motion` net — don't reintroduce z-index band-aids.

### SEO

`src/app/layout.tsx` holds all metadata, OpenGraph/Twitter cards, and the Person JSON-LD. Keep it in sync with `portfolio-config.json` when identity/positioning changes.

Origin is a single constant: `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? <vercel default>`, duplicated in `layout.tsx`, `sitemap.ts`, and `robots.ts`. Set `NEXT_PUBLIC_SITE_URL` per deployment — the fallback is a placeholder host, not a domain we own.

- `src/app/opengraph-image.tsx` generates the social card at build time via `next/og` (no checked-in PNG). Next wires it to `og:image` / `twitter:image` by file convention, so `layout.tsx` deliberately declares no `images` array.
- `src/app/sitemap.ts` and `src/app/robots.ts` are the Next file-convention routes. The old static `public/sitemap.xml` and `public/robots.txt` were deleted — if either is recreated in `public/`, it silently shadows the dynamic route.
