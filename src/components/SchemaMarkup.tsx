"use client";

import { useEffect, useState } from "react";
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

  // State for dynamic Course Schema
  const [courseSchema, setCourseSchema] = useState<any>(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      setCourseSchema(null);
      
      const isVideo = pathname.startsWith("/videos/");
      const isEbook = pathname.startsWith("/ebooks/");
      
      if (!isVideo && !isEbook) return;
      
      const id = pathname.split("/").pop();
      if (!id) return;
      
      try {
        const { getVideoById, getEbookById } = await import("@/app/actions/content");
        const { getItemMetadata } = await import("@/lib/projectMetadata");
        
        let item: any = null;
        if (isVideo) {
          item = await getVideoById(id);
        } else if (isEbook) {
          item = await getEbookById(id);
        }
        
        if (item) {
          const meta = getItemMetadata(item);
          // Convert duration format (e.g., "30 Mins" or "2.5 Hours") to ISO 8601 duration
          let durationISO = "PT1H";
          if (meta.duration.toLowerCase().includes("min")) {
            durationISO = `PT${meta.durationMins}M`;
          } else if (meta.duration.toLowerCase().includes("hour")) {
            durationISO = `PT${meta.durationMins}M`;
          }
          
          setCourseSchema({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": item.title,
            "description": meta.overview,
            "provider": {
              "@type": "Organization",
              "name": "REES52",
              "sameAs": baseUrl
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "Online",
              "courseWorkload": durationISO
            }
          });
        }
      } catch (err) {
        console.error("Failed to load schema details:", err);
      }
    }
    
    fetchCourseDetails();
  }, [pathname]);

  // Static FAQ Schema for the homepage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is REES52 Infinity Learning Hub?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "REES52 Infinity Learning Hub is a premium educational platform for robotics, embedded systems, Arduino, IoT, and STEM learning, featuring ebooks, video lectures, and live webinars."
        }
      },
      {
        "@type": "Question",
        "name": "Are the code files and schematics free to download?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all source code files (.ino sketches) and circuit connection schematics (PDFs) associated with our projects are 100% free to download for registered users."
        }
      },
      {
        "@type": "Question",
        "name": "How do I claim my project completion certificate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once you complete 100% of the steps in any project's learning curriculum checklist, a 'Claim Certificate' button will unlock, allowing you to instantly generate and download a printable PNG certificate of completion."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need physical hardware kits to complete these projects?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While you can read and watch the guides without hardware, we link each project to its companion REES52 kit and parts lists so you can buy the components and build along in real life."
        }
      }
    ]
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
      {pathname === "/" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {courseSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
        />
      )}
    </>
  );
}
