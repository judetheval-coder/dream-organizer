import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { validateEnvironment } from '@/lib/env-validation'
import { PostHogProvider } from '@/lib/analytics'
import { Analytics } from '@vercel/analytics/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ServiceWorkerRegistration } from '@/components/ServiceWorker'
import { ToastProvider } from '@/contexts/ToastContext'
import { GlobalDevControls } from '@/components/GlobalDevControls'
import NightModeEffects from '@/components/NightModeEffects'
import { devRoutesEnabled } from '@/lib/dev-utils'
import "./globals.css";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
const NoClerk: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>
// ClerkProvider has a slightly different type signature in some setups; cast to any to avoid a compile-time mismatch while still providing the wrapper.
const MaybeClerk: React.ComponentType<{ children?: React.ReactNode }> = CLERK_ENABLED ? (ClerkProvider as React.ComponentType<Record<string, unknown>>) : NoClerk

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Visnoctis - Vision of the Night | Turn Dreams Into Comics",
    template: "%s | Visnoctis",
  },
  description: "Visnoctis: Latin for 'Vision of the Night'. Dream journaling reimagined. Transform your nightly adventures into stunning visual comic stories. Record, visualize, and share your dreams like never before.",
  keywords: ["dream journal", "comic generator", "dream tracker", "dream visualization", "dream diary", "comic art", "visnoctis", "dream vision"],
  authors: [{ name: "Visnoctis" }],
  creator: "Visnoctis",
  publisher: "Visnoctis",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://lucidlaboratories.net"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Visnoctis",
    title: "Visnoctis - Vision of the Night | Turn Dreams Into Comics",
    description: "Visnoctis: 'Vision of the Night'. Dream journaling reimagined. Transform your nightly adventures into stunning visual stories.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "The Dream Machine - Dream Comics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visnoctis - Vision of the Night | Turn Dreams Into Comics",
    description: "Visnoctis: 'Vision of the Night'. Dream journaling reimagined. Transform your nightly adventures into stunning visual stories.",
    images: ["/api/og"],
    creator: "@visnoctis",
  },
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Visnoctis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Run environment validation (server-side) to catch missing/invalid config early
  validateEnvironment()

  return (
    <MaybeClerk>
      <html lang="en">
        <head>
          {/* Performance preconnects */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://app.posthog.com" />
        </head>
        <body className={`${inter.variable} font-sans antialiased`}>
          {/* Animated nebula background */}
          <div className="nebula-bg" />
          <div className="dream-dust-layer" />

          {/* Immersive night mode effects - floating orbs, glows, shooting stars */}
          <NightModeEffects />

          <ErrorBoundary>
            <ToastProvider>
              <PostHogProvider>{children}</PostHogProvider>
            </ToastProvider>
          </ErrorBoundary>
          {devRoutesEnabled() && <GlobalDevControls />}
          <ServiceWorkerRegistration />
          <Analytics />
        </body>
      </html>
    </MaybeClerk>
  );
}
