import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AelosChatbot from "@/components/AelosChatbot";
import SchemaMarkup from "@/components/SchemaMarkup";
import StoreTransitionModal from "@/components/StoreTransitionModal";
import MobileViewportHandler from "@/components/MobileViewportHandler";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: "%s | REES52 Academy",
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "REES52",
    "REES52 Academy",
    "robotics education",
    "embedded systems",
    "Arduino",
    "microcontrollers",
    "IoT",
    "AI for students",
    "sensors",
    "STEM learning",
    "electronics",
    "DIY robotics",
    "drone building",
    "robotics workshops",
    "project based learning",
    "ebooks",
    "robotics kits",
  ],
  authors: [{ name: "REES52 Academy Team" }],
  creator: "REES52",
  publisher: "REES52",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "REES52 Academy",
  },
  icons: {
    apple: "/icon-192.png",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 630, alt: "REES52 Academy robotics and electronics courses" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@rees52",
    images: [absoluteUrl("/og.png")],
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
  alternates: {
    canonical: siteConfig.url,
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeSupabaseConfig = JSON.stringify({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      "",
  }).replace(/</g, "\\u003c");

  return (
    <html lang="en" className="h-full scroll-smooth bg-background">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__REES52_SUPABASE__=${runtimeSupabaseConfig};`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <AuthProvider>
          <MobileViewportHandler />
          <SchemaMarkup />
          <Header />
          <main className="flex flex-1 flex-col page-loaded-entrance">
            {children}
          </main>
          <Footer />
          <AelosChatbot />
          <StoreTransitionModal />
        </AuthProvider>
      </body>
    </html>
  );
}
