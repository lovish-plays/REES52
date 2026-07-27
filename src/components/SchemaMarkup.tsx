import { absoluteUrl, siteConfig } from "@/lib/site";

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "REES52 (Robotics Embedded Education Services Private Limited)",
    alternateName: "REES52",
    url: siteConfig.url,
    logo: absoluteUrl("/icon-512.png"),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contactPhone,
      contactType: "customer service",
      email: siteConfig.contactEmail,
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
    sameAs: siteConfig.social,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "en-IN",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  );
}
