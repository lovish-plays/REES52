import { Metadata } from "next";
import { Phone, Mail, MapPin, MessageSquare, Clock } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact REES52",
  description: "Get in touch with REES52. Call us at +91 95995 94520 or email info@rees52.in for sales, support, and business inquiries.",
  keywords: ["Contact REES52", "REES52 Phone Number", "REES52 Support Email", "Robotics customer care"],
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10 w-full flex flex-col justify-center">
      {/* Page Title & Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-sm mb-4">
          <MessageSquare className="w-8 h-8 text-cyan-600 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-slate-900">
          Contact Us
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-extrabold mt-3">
          REES52 - PLANTING THE SEEDS OF INNOVATION
        </p>
      </div>

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full">
        {/* Left Side: Brand Philosophy */}
        <div className="glassmorphism bg-white/70 p-8 rounded-3xl shadow-xl border border-slate-200/50 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              Get In Touch
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold">
              Welcome to REES52, we are leading distributor of electronics & robotics components. 
              We are working towards excellence in electronics space and believe in pursuing business 
              through innovation and technology.
            </p>
          </div>
          
          {/* Working hours info */}
          <div className="mt-8 p-4 rounded-xl bg-slate-900/5 border border-slate-200/20 flex items-start gap-3">
            <Clock className="w-5 h-5 text-cyan-600 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Working Hours</p>
              <p className="text-[11px] text-slate-650 font-semibold mt-1">Monday – Saturday: 10:00 AM – 6:30 PM (IST)</p>
            </div>
          </div>
        </div>

        {/* Right Side: Direct Contact Details */}
        <div className="flex flex-col gap-6">
          {/* Call card */}
          <a
            href="tel:+919599594520"
            className="glassmorphism bg-white/70 p-6 rounded-2xl shadow-md border border-slate-200/50 flex items-center gap-5 hover:scale-[1.02] transition-all group cursor-pointer"
          >
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl group-hover:bg-green-500/20 transition-colors">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Call Us</span>
              <span className="text-md md:text-lg font-black text-slate-900 block mt-0.5">
                +91 95995 94520
              </span>
            </div>
          </a>

          {/* Email card */}
          <a
            href="mailto:info@rees52.in"
            className="glassmorphism bg-white/70 p-6 rounded-2xl shadow-md border border-slate-200/50 flex items-center gap-5 hover:scale-[1.02] transition-all group cursor-pointer"
          >
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
              <Mail className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mail Us</span>
              <span className="text-md md:text-lg font-black text-slate-900 block mt-0.5">
                info@rees52.in
              </span>
            </div>
          </a>

          {/* Address card */}
          <div className="glassmorphism bg-white/70 p-6 rounded-2xl shadow-md border border-slate-200/50 flex items-center gap-5">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Address</span>
              <span className="text-xs font-bold text-slate-800 block mt-1 leading-snug">
                G-9, Om Vihar, Phase-5, Uttam Nagar,<br />
                New Delhi - 110059, India
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
