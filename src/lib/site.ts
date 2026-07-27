export const siteConfig = {
  name: "REES52 Academy",
  shortName: "REES52",
  description:
    "Learn robotics, Arduino, ESP32, IoT, AI, electronics, and STEM through practical courses, projects, quizzes, and downloadable guides.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://rees52.tech").replace(/\/$/, ""),
  locale: "en_IN",
  contactEmail: "info@rees52.in",
  contactPhone: "+91-9599594520",
  social: [
    "https://www.youtube.com/@REES52_Official",
    "https://www.linkedin.com/company/rees-52/",
    "https://www.facebook.com/rees52education/",
    "https://www.instagram.com/rees52_b2b",
    "https://x.com/rees52education",
  ],
} as const;

export function absoluteUrl(path = "") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
