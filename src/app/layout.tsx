import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AelosChatbot from "@/components/AelosChatbot";
import CyberBackground from "@/components/CyberBackground";
import RobotPeeker from "@/components/RobotPeeker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SchemaMarkup from "@/components/SchemaMarkup";
import StoreTransitionModal from "@/components/StoreTransitionModal";
import MobileViewportHandler from "@/components/MobileViewportHandler";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import SplashLoader from "@/components/SplashLoader";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: "%s | REES52 Academy",
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "REES52",
    "REES52 Academy",
    "Learning Hub",
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
  authors: [{ name: "REES52 Learning Team" }],
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
    images: [{ url: absoluteUrl("/icon-512.png"), width: 512, height: 512, alt: "REES52 Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@rees52",
    images: [absoluteUrl("/icon-512.png")],
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
  themeColor: "#0D0E12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth bg-background">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
        <meta name="google-adsense-account" content="ca-pub-4035712855313003" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4035712855313003"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <AuthProvider>
          <SplashLoader />
          <ScrollProgressBar />
          <MobileViewportHandler />
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <SchemaMarkup />
          <RobotPeeker />
          <CyberBackground />
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
