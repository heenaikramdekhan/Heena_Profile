import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Primary UI typeface — precise, engineered grotesk (Vercel's Geist)
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Monospace for numeric/label accents
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Canonical origin. Override per-deployment with NEXT_PUBLIC_SITE_URL —
 * the default is the Vercel preview host, not a domain we claim to own.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://heena-portfolio.vercel.app";

const TITLE = "Heena | QA Engineer and AI Engineer";
const DESCRIPTION =
  "Software QA Engineer and AI Engineer. I break AI systems before your users do, using adversarial testing, LLM evaluation, and grounding checks, then build the multi-agent and RAG systems that hold up.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Heena"
  },
  description: DESCRIPTION,
  keywords: [
    "Heena",
    "Heena QA Engineer",
    "QA Engineer",
    "Software Quality Assurance Engineer",
    "AI Quality Engineer",
    "LLM Evaluation",
    "AI Testing",
    "Adversarial Testing",
    "Red Teaming",
    "Test Automation",
    "Selenium WebDriver",
    "Applitools",
    "Postman",
    "API Testing",
    "Model-Based Testing",
    "AI Engineer",
    "Multi-Agent Systems",
    "RAG",
    "Retrieval-Augmented Generation",
    "LangGraph",
    "LangChain",
    "Vector Search",
    "Professional Portfolio"
  ],
  authors: [
    {
      name: "Heena",
      url: SITE_URL,
    },
  ],
  creator: "Heena",
  publisher: "Heena",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // og:image / twitter:image are generated at build time by app/opengraph-image.tsx
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Heena Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      }
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.svg?v=2",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
  classification: "Portfolio Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Heena",
              "jobTitle": "Software QA Engineer & AI Engineer",
              "url": SITE_URL,
              "image": `${SITE_URL}/profile.jpeg`,
              "sameAs": [
                "https://www.linkedin.com/in/heena-559584156/",
                "https://github.com/heenaikramdekhan",
              ],
              "worksFor": [
                {
                  "@type": "Organization",
                  "name": "SageTeck"
                },
                {
                  "@type": "Organization",
                  "name": "SkilliHire"
                }
              ],
              "alumniOf": {
                "@type": "Organization",
                "name": "National University of Sciences and Technology (NUST)"
              },
              "knowsAbout": [
                "Software Quality Assurance",
                "Test Automation",
                "Model-Based Testing",
                "API Testing",
                "AI Quality Engineering",
                "LLM Evaluation",
                "Adversarial Testing",
                "Retrieval-Augmented Generation",
                "Multi-Agent Systems",
                "Vector Search"
              ],
              "description": DESCRIPTION
            })
          }}
        />
      </head>
      {/*
        suppressHydrationWarning: browser extensions (Grammarly, password
        managers, translators) inject attributes onto <body> before React
        hydrates — e.g. data-new-gr-c-s-check-loaded, data-gr-ext-installed —
        which React reports as a hydration mismatch even though our server and
        client output are identical. This only suppresses the warning for
        <body>'s own attributes, one level deep; genuine mismatches inside the
        tree still surface normally.
      */}
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}