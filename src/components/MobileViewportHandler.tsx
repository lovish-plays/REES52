"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function MobileViewportHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset scroll to top (0, 0) whenever route or search parameters change
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Instant scroll to the header top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent browsers from restoring bottom scroll position on mobile page refresh/navigation
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const updateViewport = () => {
      const vv = window.visualViewport;
      if (vv) {
        const height = vv.height;
        const offsetTop = vv.offsetTop;
        const layoutHeight = window.innerHeight;

        document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
        document.documentElement.style.setProperty("--visual-viewport-offsetTop", `${offsetTop}px`);
        document.documentElement.style.setProperty("--layout-viewport-height", `${layoutHeight}px`);

        // Scroll active input into view when virtual keyboard pops up
        if (height < layoutHeight - 80) {
          const activeEl = document.activeElement as HTMLElement;
          if (
            activeEl &&
            (activeEl.tagName === "INPUT" ||
              activeEl.tagName === "TEXTAREA" ||
              activeEl.contentEditable === "true")
          ) {
            activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true")
      ) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
      updateViewport();
    }

    document.addEventListener("focusin", handleFocusIn);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
      }
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  return null;
}
