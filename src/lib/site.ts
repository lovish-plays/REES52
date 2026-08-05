export const siteConfig = {
  name: "REES52 Tech",
  alternateName: "REES52 Academy",
  shortName: "REES52",
  description:
    "Learn Robotics, Arduino, ESP32, Raspberry Pi, AI, IoT and Electronics through interactive courses, coding playground, projects, quizzes, downloadable resources and certificates.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://rees52.tech").replace(/\/$/, ""),
  locale: "en_IN",
  contactEmail: "info@rees52.tech",
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

export function siteContentLastModified() {
  const configured = process.env.CONTENT_LAST_MODIFIED || "2026-07-29T00:00:00.000Z";
  const parsed = new Date(configured);
  return Number.isNaN(parsed.getTime()) ? new Date("2026-07-29T00:00:00.000Z") : parsed;
}
