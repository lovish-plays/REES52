import { Metadata } from "next";
import { Sparkles, ShieldCheck, Users, Target, Heart, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "About REES52 | Leading Electronics & Robotics Distributor",
  description: "Learn about REES52, a leading distributor of electronics & robotics components. Discover our core values of customer-centricity, innovation, and integrity, and meet our team.",
  keywords: ["About REES52", "Robotics distributor", "Electronics components distributor", "REES52 Values"],
};

export default function AboutPage() {
  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 py-16 md:py-24 relative z-10 w-full">
      {/* Page Title & Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-sm mb-4">
          <GraduationCap className="w-8 h-8 text-cyan-600 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-slate-900">
          About <span className="text-cyan-600">REES52</span>
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-extrabold mt-3 max-w-md mx-auto">
          Planting the Seeds of Innovation and Engineering
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="glassmorphism bg-white/70 p-8 md:p-12 rounded-3xl shadow-xl mb-16 border border-slate-200/50">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-600" />
              <span>Welcome to REES52</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              Welcome to REES52, we are leading distributor of electronics & robotics components. 
              We are working towards excellence in electronics space and believe in pursuing business 
              through innovation and technology. Our team comes with several years of industry experience 
              and comprise of a highly motivated set of specialists & industry experts.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              Our goal is to be a leader in the industry by providing enhanced services, products, 
              relationship and profitability.
            </p>
          </div>
          
          <div className="w-full md:w-80 flex flex-col gap-4 bg-slate-900/5 p-6 rounded-2xl border border-slate-200/30">
            <div className="text-center py-4">
              <span className="text-3xl font-black text-cyan-600 block">13+</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Years in Industry</span>
            </div>
            <div className="border-t border-slate-200/40 my-1"></div>
            <div className="text-center py-4">
              <span className="text-3xl font-black text-cyan-600 block">10,000+</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Products Distributed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">
            Our Values
          </h2>
          <div className="w-12 h-1 bg-cyan-600 mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Value 1 */}
          <div className="glassmorphism bg-white/70 p-6 rounded-2xl shadow-md border border-slate-200/50 hover:scale-105 transition-all">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl w-fit mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-md font-black uppercase tracking-wider text-slate-900 mb-2">
              1) Customer-Centric
            </h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              We prioritize the needs and satisfaction of our customers, striving to exceed expectations with every interaction.
            </p>
          </div>

          {/* Value 2 */}
          <div className="glassmorphism bg-white/70 p-6 rounded-2xl shadow-md border border-slate-200/50 hover:scale-105 transition-all">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl w-fit mb-4">
              <Sparkles className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-md font-black uppercase tracking-wider text-slate-900 mb-2">
              2) Innovation
            </h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Embracing creativity and innovation, we continuously seek new and improved ways to deliver products.
            </p>
          </div>

          {/* Value 3 */}
          <div className="glassmorphism bg-white/70 p-6 rounded-2xl shadow-md border border-slate-200/50 hover:scale-105 transition-all">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl w-fit mb-4">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-md font-black uppercase tracking-wider text-slate-900 mb-2">
              3) Integrity
            </h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Honesty and transparency are at the core of our business. We believe in building trust through ethical practices.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="glassmorphism bg-white/70 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-sm mb-4">
            <Users className="w-6 h-6 text-cyan-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900 mb-4">
            Our Team
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed font-semibold">
            Meet the passionate individuals who drive REES52 forward. Our diverse team brings a wealth of experience and expertise to ensure the success of our mission.
          </p>
        </div>
      </div>
    </div>
  );
}
