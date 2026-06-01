import { Metadata } from "next";
import { Cookie, ShieldAlert, CheckCircle2, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | REES52 Infinity Learning Hub",
  description: "Read the official Cookie Policy of REES52. Learn how we use essential, local storage fallback session cookies, and analytics cookies to deliver a secure learning experience.",
  keywords: ["REES52 Cookie Policy", "robotic portal cookies", "essential cookies", "analytics tracking"],
  alternates: {
    canonical: "https://rees52.com/cookie-policy",
  }
};

export default function CookiePolicyPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10 w-full">
      {/* Page Title & Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-sm mb-4">
          <Cookie className="w-8 h-8 text-cyan-600 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-slate-900">
          Cookie Policy
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-extrabold mt-3">
          EFFECTIVE DATE: JUNE 1, 2026
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Overview */}
        <div className="glassmorphism bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/50">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-cyan-600" />
            <span>1. What Are Cookies?</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
            Cookies are small text files stored on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-3">
            At Robotics Embedded Education Services Private Limited (REES52), we believe in absolute transparency. This Cookie Policy explains how we use cookies and local storage tokens on our educational Infinity Learning Hub portal to provide secure, high-performance learning workflows.
          </p>
        </div>

        {/* Section 2: Types of Cookies */}
        <div className="glassmorphism bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/50">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-cyan-600" />
            <span>2. Types of Cookies We Use</span>
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-600/5 border border-cyan-500/20">
              <h3 className="text-xs font-black uppercase text-cyan-900 tracking-wider">A. Essential Authentication Cookies</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-1">
                These cookies are strictly necessary to provide you with secure access to protected dashboard workflows (e.g. My Learning lectures, unlocked Ebooks, and Admin controls).
              </p>
              <ul className="list-disc pl-5 mt-2 text-[10px] text-slate-500 space-y-1 font-bold">
                <li><strong>Supabase JWT Session Cookies:</strong> Authenticates user requests and protects database tables.</li>
                <li><strong>Local JSON Web Token Cookie:</strong> Provides secondary secure offline session validation to safeguard profiles.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-500/20">
              <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider">B. Performance & Analytics Cookies</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-1">
                These cookies collect aggregate information to help us understand how learners interact with Ebook guides, video lectures, and Aelos chatbot queries.
              </p>
              <ul className="list-disc pl-5 mt-2 text-[10px] text-slate-500 space-y-1 font-bold">
                <li><strong>Google Analytics (GA4) Cookies:</strong> Tracks anonymous page views, connection speeds, and content enrollments to optimize download latency.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-pink-600/5 border border-pink-500/20">
              <h3 className="text-xs font-black uppercase text-pink-900 tracking-wider">C. Sponsored Advertising Cookies (AdSense Ready)</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-1">
                These cookies track user navigation histories to display personalized, relevant, and secure educational hardware sponsorships and AdSense units.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Managing Cookies */}
        <div className="glassmorphism bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/50">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
            <span>3. How Can You Manage Cookies?</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
            You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to certain secure sections (such as Ebook reading and video viewing) will be highly restricted as they depend on essential authentication tokens.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-3">
            To opt out of targeted Google Analytics event tracking or AdSense tracking, please consult your Google account privacy dashboard or use the Google Analytics Opt-out Browser Add-on.
          </p>
        </div>

        {/* Section 4: Contact info */}
        <div className="glassmorphism bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/50">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-cyan-600" />
            <span>4. Questions & Policy Updates</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please re-visit this Cookie Policy regularly to stay informed.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-3">
            If you have any questions or data request queries about our Cookie Policy, please contact our support department at:
            <a href="mailto:info@rees52.in" className="text-cyan-700 hover:text-cyan-600 underline font-bold ml-1">info@rees52.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
