import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import ErrorBoundary from '@/components/ErrorBoundary'
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Dream Organizer - Turn Your Dreams Into Beautiful Comics",
    template: "%s | Dream Organizer",
  },
  description: "AI-powered dream journaling that transforms your nightly adventures into stunning visual stories. Record, visualize, and share your dreams like never before.",
  keywords: ["dream journal", "AI art", "comic generator", "dream tracker", "DALL-E", "dream visualization", "dream diary", "AI comic"],
  authors: [{ name: "Dream Organizer" }],
  creator: "Dream Organizer",
  publisher: "Dream Organizer",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dream-organizer.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Dream Organizer",
    title: "Dream Organizer - Turn Your Dreams Into Beautiful Comics",
    description: "AI-powered dream journaling that transforms your nightly adventures into stunning visual stories.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dream Organizer - AI Dream Comics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dream Organizer - Turn Your Dreams Into Beautiful Comics",
    description: "AI-powered dream journaling that transforms your nightly adventures into stunning visual stories.",
    images: ["/og-image.png"],
    creator: "@dreamorganizer",
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
