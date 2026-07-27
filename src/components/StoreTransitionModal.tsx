"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag, ArrowRight, X } from "lucide-react";

export default function StoreTransitionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      let element = e.target as HTMLElement | null;
      while (element && element.tagName !== "A") {
        element = element.parentElement;
      }

      if (element && element.tagName === "A") {
        const anchor = element as HTMLAnchorElement;
        const href = anchor.href;

        // Intercept links going to rees52.com (but not within current hub rees52.tech)
        if (href && href.includes("rees52.com") && !href.includes("rees52.tech")) {
          e.preventDefault();
          
          // Append UTM parameters to target URL if not already present
          let finalUrl = href;
          try {
            const urlObj = new URL(href);
            if (!urlObj.searchParams.has("utm_source")) {
              urlObj.searchParams.set("utm_source", "learning_hub");
              urlObj.searchParams.set("utm_medium", "referral");
              urlObj.searchParams.set("utm_campaign", "learning_platform_transition");
              finalUrl = urlObj.toString();
            }
          } catch (err) {
            console.error("Failed to parse transition URL:", err);
          }

          setTargetUrl(finalUrl);
          setIsOpen(true);
          setCountdown(3);
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // Handle automatic transition countdown
  useEffect(() => {
    if (!isOpen || countdown <= 0) {
      if (isOpen && countdown === 0) {
        handleProceed();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  const handleProceed = () => {
    setIsOpen(false);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0d0e12]/60 backdrop-blur-md transition-opacity duration-300"
        onClick={handleCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-[calc(100%-2rem)] md:w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/50 bg-[#F7F4EB] p-6 text-slate-800 shadow-2xl animate-fade-in-up">
        {/* Decorative cyber gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
        
        {/* Close Button */}
        <button 
          onClick={handleCancel}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          {/* Logo icon frame */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
            <ShoppingBag className="h-6 w-6 animate-pulse" />
          </div>

          <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
            Transitioning to Official Store
          </h3>
          
          <p className="mt-2.5 text-xs text-slate-655 font-medium leading-relaxed">
            You are leaving REES52 Academy to view the companion hardware kit on the REES52 store.
          </p>

          {/* Countdown & Loading Bar */}
          <div className="mt-5 w-full bg-slate-200/70 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-600 transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
          <span className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
            Redirecting in {countdown > 0 ? `${countdown}s` : "loading..."}
          </span>

          {/* Destination Preview */}
          <div className="mt-4 w-full rounded-xl bg-slate-100 p-2.5 border border-slate-200/60 font-mono text-[9px] text-slate-550 break-all select-all">
            {targetUrl}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex w-full gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl border border-slate-350 hover:bg-slate-200/60 transition-colors cursor-pointer text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>Go to Store</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
