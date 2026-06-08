import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, 
  ExternalLink, 
  ShoppingCart, 
  Download, 
  Clock, 
  Compass
} from "lucide-react";
import { getEbookById, getProductById, getUnifiedFeed } from "@/app/actions/content";
import { getItemMetadata } from "@/lib/projectMetadata";
import EbookProgressChecklist from "@/components/EbookProgressChecklist";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate SEO Metadata Server-Side
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const ebook = await getEbookById(id);
  if (!ebook) return {};

  const meta = getItemMetadata({ ...ebook, type: "ebook" });
  
  return {
    title: `${ebook.title} Project Guide`,
    description: meta?.overview || `Read the official REES52 companion Ebook guide for ${ebook.title}. Complete hardware lists, schematics, and walkthroughs.`,
    alternates: {
      canonical: `https://rees52.tech/ebooks/${id}`,
    },
    openGraph: {
      title: `${ebook.title} Project Guide | REES52 Learning Hub`,
      description: meta?.overview || `Read the official REES52 companion Ebook guide for ${ebook.title}.`,
      url: `https://rees52.tech/ebooks/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${ebook.title} Project Guide`,
      description: meta?.overview || `Read the official REES52 companion Ebook guide for ${ebook.title}.`,
    }
  };
}

export default async function EbookDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const ebook = await getEbookById(id);
  if (!ebook) {
    redirect("/");
  }

  // Fetch companion product
  let product = null;
  if (ebook.parent_product_id) {
    product = await getProductById(ebook.parent_product_id);
  }

  // Fetch meta details
  const meta = getItemMetadata({ ...ebook, type: "ebook" });

  // Fetch related projects (same category)
  let related: any[] = [];
  try {
    const feedData = await getUnifiedFeed();
    related = feedData.feed
      .filter(it => it.categoryId === ebook.category_id && it.id !== ebook.id)
      .slice(0, 3);
  } catch (err) {
    console.error("Error loading related feeds:", err);
  }

  // Define structured JSON-LD schemas
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": ebook.title,
    "description": meta?.overview || `Guide for ${ebook.title}`,
    "inLanguage": "en-US",
    "author": {
      "@type": "Organization",
      "name": "REES52"
    },
    "publisher": {
      "@type": "Organization",
      "name": "REES52",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rees52.tech/icon.png"
      }
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rees52.tech"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Ebooks",
        "item": "https://rees52.tech/?type=ebooks"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": ebook.title,
        "item": `https://rees52.tech/ebooks/${ebook.id}`
      }
    ]
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6 text-slate-800 animate-fade-in">
      
      {/* Structured SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Back Button */}
      <Link href="/" className="flex items-center gap-2 text-slate-650 hover:text-cyan-600 transition-colors w-fit text-xs font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explorer</span>
      </Link>

      {/* Main Grid Layout: Detail + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Ebook Viewer & Context */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          
          <div className="glassmorphism p-5 rounded-2xl border border-slate-200/50 flex flex-col gap-4 shadow-md bg-white/60">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/55 pb-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-wide uppercase leading-snug">
                {ebook.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${
                  meta?.difficulty === "Beginner" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
                  meta?.difficulty === "Intermediate" ? "border-amber-200 bg-amber-50 text-amber-800" :
                  "border-rose-200 bg-rose-50 text-rose-800"
                }`}>
                  {meta?.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {meta?.duration}
                </span>
              </div>
            </div>

            {/* Inline PDF Viewer Frame */}
            <div className="relative w-full h-[550px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md">
              <iframe
                src={`${ebook.pdf_url}#toolbar=0&navpanes=0`}
                className="w-full h-full"
                title={ebook.title}
              ></iframe>
            </div>

            {/* Open Full Screen Link */}
            <a
              href={ebook.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 border border-cyan-500 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-800 font-extrabold text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span>Open Document in Full Window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Interactive Progress Checklist Subcomponent */}
          <EbookProgressChecklist courseId={ebook.id} courseName={ebook.title} />

          {/* Overview & Objectives */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-200/50 bg-white/60 space-y-4 text-slate-700">
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2">
                Project Overview
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {meta?.overview}
              </p>
            </div>

            {meta?.learningObjectives && meta.learningObjectives.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2">
                  Learning Objectives
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-655 font-medium leading-relaxed list-disc list-inside">
                  {meta.learningObjectives.map((obj, i) => (
                    <li key={i} className="marker:text-cyan-600">{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Downloads Block */}
          {meta?.downloads && meta.downloads.length > 0 && (
            <div className="glassmorphism p-6 rounded-2xl border border-slate-200/50 bg-white/60 space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-950 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-cyan-600" /> Ebook code & schematics
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                {meta.downloads.map((d, i) => (
                  <a
                    key={i}
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <span>{d.label}</span>
                    <Download className="w-4 h-4 text-cyan-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sidebar (Shop Components & Related Content) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Shop Components section */}
          <div className="glassmorphism-cyan p-6 rounded-2xl border border-cyan-350 bg-white/70 shadow-xl flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-100/50 px-3 py-1 rounded-full border border-cyan-200 w-fit">
              Project Hardware Kit
            </span>

            {product && (
              <div className="border-b border-cyan-200/50 pb-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Companion Hardware Kit</p>
                <h4 className="font-black text-xs text-slate-900 mt-1 uppercase tracking-wide">{product.name}</h4>
              </div>
            )}

            {meta?.components && meta.components.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Components Used in This Project</p>
                
                <div className="flex flex-col gap-2">
                  {meta.components.map((c, i) => (
                    <a
                      key={i}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-cyan-50/30 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all group cursor-pointer text-left"
                    >
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-880 group-hover:text-cyan-800">{c.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {product && (
              <a
                href={product.external_purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black uppercase text-xs tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
              >
                <span>Buy Complete Project Kit</span>
                <ShoppingCart className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Related Projects */}
          {related.length > 0 && (
            <div className="glassmorphism p-6 rounded-2xl border border-slate-200/50 bg-white/60 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Compass className="w-4 h-4 text-cyan-600" /> Related Workshops
              </h3>
              
              <div className="flex flex-col gap-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-cyan-350/30 rounded-xl flex flex-col gap-1.5 transition-all group"
                  >
                    <span className="text-[7.5px] bg-slate-200 border border-slate-350 rounded px-1.5 py-0.5 text-slate-700 w-fit font-black uppercase tracking-wider">
                      {item.type}
                    </span>
                    <h4 className="text-[11px] font-black text-slate-900 group-hover:text-cyan-700 truncate uppercase leading-snug">
                      {item.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
