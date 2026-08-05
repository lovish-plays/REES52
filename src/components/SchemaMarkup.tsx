import { absoluteUrl, siteConfig } from "@/lib/site";

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "REES52 Tech",
    legalName: "Robotics Embedded Education Services Private Limited",
    alternateName: ["REES52 Academy", "REES52"],
    url: "https://rees52.tech",
    logo: "https://rees52.tech/logo.png",
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
    url: "https://rees52.tech/",
    name: "REES52 Tech",
    alternateName: "REES52 Academy",
    publisher: {
      "@type": "Organization",
      name: "REES52 Tech",
      url: "https://rees52.tech",
      logo: "https://rees52.tech/logo.png",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  );
}
