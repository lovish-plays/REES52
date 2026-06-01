import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AelosChatbot from "@/components/AelosChatbot";
import CyberBackground from "@/components/CyberBackground";
import SplashLoader from "@/components/SplashLoader";
import RobotPeeker from "@/components/RobotPeeker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SchemaMarkup from "@/components/SchemaMarkup";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "REES52 Infinity Learning Hub | Premium Robotics & STEM Education",
    template: "%s | REES52 Infinity Learning Hub"
  },
  description:
    "REES52 Infinity Learning Hub is a premium educational Progressive Web App (PWA) for robotics, embedded systems, Arduino, IoT, sensors, and STEM learning — featuring ebooks, video lectures, and live webinars.",
  keywords: [
    "REES52",
    "Infinity Learning Hub",
    "robotics education",
    "embedded systems",
    "Arduino",
    "microcontrollers",
    "IoT",
    "sensors",
    "STEM learning",
    "electronics",
    "DIY robotics",
    "drone building",
    "FPV",
    "robotics workshops",
    "video lectures",
    "ebooks",
    "live webinars",
    "DIY electronics",
    "robotics kits"
  ],
  authors: [{ name: "REES52 Infinity Learning Team" }],
  creator: "REES52",
  publisher: "REES52",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Infinity Learning",
  },
  icons: {
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "REES52 Infinity Learning Hub | Premium Robotics & STEM Education",
    description:
      "Master robotics, embedded systems, Arduino, IoT, and drone building with hands-on ebooks, video lectures, and live webinars.",
    url: "https://rees52.com",
    siteName: "REES52 Infinity Learning Hub",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "REES52 Infinity Learning Hub | Robotics & STEM Education",
    description:
      "Explore ebooks, videos, and webinars to build robotics, embedded systems, and drone hardware projects.",
    creator: "@rees52"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://rees52.com",
  },
  verification: {
    google: "yoursiteconsoleverificationtoken",
  }
};

export const viewport: Viewport = {
  themeColor: "#0D0E12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth bg-background">
      <head>
        {/* Explicit crossorigin so Vercel preview deployments pass session
            cookies when fetching the PWA manifest — prevents 401 errors */}
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <SchemaMarkup />
          <SplashLoader />
          <RobotPeeker />
          <CyberBackground />
          <Header />
          <main className="flex-1 flex flex-col page-loaded-entrance">
            {children}
          </main>
          <Footer />
          <AelosChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
