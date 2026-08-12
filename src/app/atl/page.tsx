import type { Metadata } from "next";
import AtlNavbar from "@/components/atl/AtlNavbar";
import AtlHero from "@/components/atl/AtlHero";
import AtlFunding from "@/components/atl/AtlFunding";
import AtlTimeline from "@/components/atl/AtlTimeline";
import AtlPackages from "@/components/atl/AtlPackages";
import AtlComparison from "@/components/atl/AtlComparison";
import AtlSocialProof from "@/components/atl/AtlSocialProof";
import AtlFooter from "@/components/atl/AtlFooter";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Setup Atal Tinkering Lab (ATL) in Schools | NITI Aayog Grant Partner | REES52 Tech",
  description:
    "Official turn-key partner for setting up Atal Tinkering Labs (ATL) under NITI Aayog AIM scheme. ₹20 Lakh Govt. grant assistance, P1-P4 equipment packages, 3D lab layout, teacher training, and PFMS compliance.",
  openGraph: {
    title: "Setup Atal Tinkering Lab (ATL) in Schools | REES52 Tech",
    description:
      "Turnkey partner for NITI Aayog Atal Tinkering Labs (ATL). Equipment packages P1-P4, ₹20 Lakh Govt grant guidance & teacher training.",
    url: absoluteUrl("/atl"),
    siteName: "REES52 Tech",
    type: "website",
  },
};

export default function AtlLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-slate-950">
      {/* 1. Global Navigation */}
      <AtlNavbar />

      {/* 2. Hero Section & Lead Form */}
      <AtlHero />

      {/* 3. Funding & Vision (₹20 Lakh Grant Breakdown) */}
      <AtlFunding />

      {/* 4. Setup Roadmap (4-Step Timeline & 1,500 Sq. Ft. Note) */}
      <AtlTimeline />

      {/* 5. ATL Equipment Packages (P1 - P4 Interactive Tabs) */}
      <AtlPackages />

      {/* 6. Why Choose Us (B2B Comparison Table) */}
      <AtlComparison />

      {/* 7. Testimonials & Social Proof (Infinite Marquee + Carousel) */}
      <AtlSocialProof />

      {/* 8. Footer */}
      <AtlFooter />
    </div>
  );
}
