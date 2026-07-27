import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, 
  ExternalLink, 
  ShoppingCart, 
  Download, 
  Clock, 
  Compass,
  Play
} from "lucide-react";
import { getVideoById, getProductById, getUnifiedFeed } from "@/app/actions/content";
import { getItemMetadata } from "@/lib/projectMetadata";
import VideoProgressChecklist from "@/components/VideoProgressChecklist";
import { absoluteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate SEO Metadata Server-Side
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const video = await getVideoById(id);
  if (!video) return {};

  const meta = getItemMetadata({ ...video, type: "video" });
  
  return {
    title: `${video.title} Video Guide`,
    description: meta?.overview || `Watch the official REES52 video tutorial for ${video.title}. Complete hardware code, blueprints, and assembly guides.`,
    alternates: {
      canonical: absoluteUrl(`/videos/${id}`),
    },
    openGraph: {
      title: `${video.title} Video Guide | REES52 Academy`,
      description: meta?.overview || `Watch the official REES52 video tutorial for ${video.title}.`,
      url: absoluteUrl(`/videos/${id}`),
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title: `${video.title} Video Guide`,
      description: meta?.overview || `Watch the official REES52 video tutorial for ${video.title}.`,
    }
  };
}

export default async function VideoDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const video = await getVideoById(id);
  if (!video) {
    redirect("/");
  }

  // Fetch companion product
  let product = null;
  if (video.parent_product_id) {
    product = await getProductById(video.parent_product_id);
  }

  // Fetch meta details
  const meta = getItemMetadata({ ...video, type: "video" });

  // Fetch related projects (same category)
  let related: any[] = [];
  try {
    const feedData = await getUnifiedFeed();
    related = feedData.feed
      .filter(it => it.categoryId === video.category_id && it.id !== video.id)
      .slice(0, 3);
  } catch (err) {
    console.error("Error loading related feeds:", err);
  }

  // Process YouTube video details
  const embedId = video.youtube_url ? video.youtube_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] : null;
  const embedUrl = embedId ? `https://www.youtube.com/embed/${embedId}` : null;

  // Define structured JSON-LD schemas
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": meta?.overview || `Video tutorial for ${video.title}`,
    "thumbnailUrl": embedId ? `https://img.youtube.com/vi/${embedId}/0.jpg` : absoluteUrl("/icon.png"),
    "uploadDate": video.created_at || new Date().toISOString(),
    "embedUrl": embedUrl || video.youtube_url,
    "publisher": {
      "@type": "Organization",
      "name": "REES52",
      "logo": {
        "@type": "ImageObject",
        "url": absoluteUrl("/icon.png")
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
        "item": absoluteUrl()
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Videos",
        "item": absoluteUrl("/?type=videos")
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": video.title,
        "item": absoluteUrl(`/videos/${video.id}`)
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
        
        {/* LEFT COLUMN: Video Player & Context */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          
          <div className="glassmorphism p-5 rounded-2xl border border-slate-200/50 flex flex-col gap-4 shadow-md bg-white/60">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/55 pb-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-wide uppercase leading-snug">
                {video.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${
                  meta?.difficulty === "Beginner" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
                  meta?.difficulty === "Intermediate" ? "border-amber-200 bg-amber-50 text-amber-800" :
                  "border-rose-200 bg-rose-50 text-rose-800"
                }`}>
                  {meta?.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-650 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {meta?.duration}
                </span>
              </div>
            </div>

            {/* Embed Container with Aspect Ratio */}
            {embedUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black shadow-md">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-105 flex flex-col items-center justify-center text-slate-600 text-center p-6">
                <Play className="w-12 h-12 text-slate-400 mb-2" />
                <p className="text-xs uppercase tracking-wider font-semibold">Video preview unavailable</p>
              </div>
            )}

            {/* Watch Full screen link */}
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-red-600/90 hover:bg-red-500/95 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span>Watch Full Video on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Interactive Progress Checklist Subcomponent */}
          <VideoProgressChecklist courseId={video.id} courseName={video.title} />

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
                <Download className="w-4 h-4 text-cyan-600" /> Source Code & Schematic Downloads
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
          <div className="glassmorphism-cyan p-6 rounded-2xl border border-cyan-300 bg-white/70 shadow-xl flex flex-col gap-4">
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
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-cyan-300/30 rounded-xl flex flex-col gap-1.5 transition-all group"
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
