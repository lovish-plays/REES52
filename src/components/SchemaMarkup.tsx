import { absoluteUrl, siteConfig } from "@/lib/site";

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    legalName: "Robotics Embedded Education Services Private Limited",
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
    "@id": absoluteUrl("/#website"),
    name: "REES52 Academy",
    alternateName: [
      "REES52 Academy",
      "REES52 Robotics Academy",
      "REES52 STEM Courses",
      "REES52",
    ],
    url: siteConfig.url,
    inLanguage: "en-IN",
    publisher: { "@id": absoluteUrl("/#organization") },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  );
}
