"use client";

import { usePathname } from "next/navigation";

export default function SchemaMarkup() {
  const pathname = usePathname();
  const baseUrl = "https://rees52.tech";

  // 1. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "REES52 (Robotics Embedded Education Services Private Limited)",
    "alternateName": "REES52",
    "url": baseUrl,
    "logo": `${baseUrl}/icon-512.png`,
    "foundingDate": "2013",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9599594520",
      "contactType": "customer service",
      "email": "info@rees52.in",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    },
    "sameAs": [
      "https://www.youtube.com/@REES52_Official",
      "https://www.linkedin.com/company/rees-52/",
      "https://www.facebook.com/rees52education/",
      "https://www.instagram.com/rees52_b2b",
      "https://x.com/rees52education"
    ]
  };

  // 2. Website Searchbox Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "REES52 Learning Hub",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // 3. Dynamic Breadcrumb Schema
  const pathParts = pathname.split("/").filter(part => part);
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl
    }
  ];

  pathParts.forEach((part, index) => {
    const accumulativePath = "/" + pathParts.slice(0, index + 1).join("/");
    const label = part
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize words
      
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": label,
      "item": `${baseUrl}${accumulativePath}`
    });
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {breadcrumbItems.length > 1 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
