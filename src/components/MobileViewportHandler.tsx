"use client";

import { useEffect } from "react";

export default function MobileViewportHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewport = () => {
      const vv = window.visualViewport;
      if (vv) {
        const height = vv.height;
        const offsetTop = vv.offsetTop;
        const layoutHeight = window.innerHeight;
        
        document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
        document.documentElement.style.setProperty("--visual-viewport-offsetTop", `${offsetTop}px`);
        document.documentElement.style.setProperty("--layout-viewport-height", `${layoutHeight}px`);

        // If the visual viewport is shorter than the layout viewport (allowing a small toolbar margin),
        // the virtual keyboard is likely open. Scroll the active input into view.
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
        // Delay slightly to let the OS keyboard start rendering
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
