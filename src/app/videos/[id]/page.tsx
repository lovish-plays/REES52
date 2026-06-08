import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVideoById, getProductById } from '@/app/actions/content';
import { Play, ArrowLeft, ExternalLink, ShoppingCart, Award } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getYoutubeEmbedId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) {
    notFound();
  }

  const embedId = getYoutubeEmbedId(video.youtube_url);
  const embedUrl = embedId ? `https://www.youtube.com/embed/${embedId}` : null;

  // Fetch mapped parent hardware product
  const product = video.parent_product_id ? await getProductById(video.parent_product_id) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6 text-slate-800">
      
      {/* Back Button */}
      <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors w-fit text-xs font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explorer</span>
      </Link>

      {/* Main Grid: Detail + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Video Player & Description (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="glassmorphism p-5 rounded-2xl border border-slate-200/50 flex flex-col gap-4 shadow-md">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-wide">
              {video.title}
            </h1>
            <p className="text-slate-600 text-xs uppercase tracking-widest flex items-center gap-2 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              Video Lecture Preview
            </p>
            
            {/* Embed Container with Aspect Ratio */}
            {embedUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-600 text-center p-6">
                <Play className="w-12 h-12 text-slate-400 mb-2" />
                <p className="text-xs uppercase tracking-wider font-semibold">Video preview unavailable</p>
              </div>
            )}

            {/* Stylized YouTube CTA */}
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-3 bg-red-600/90 hover:bg-red-500/95 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-sm backdrop-blur-sm cursor-pointer"
            >
              <span>Watch Full Video on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Curriculum outline context card */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-200/30 text-slate-700">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-cyan-600 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" /> Course Curriculum Context
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              This preview module covers essential hardware layout configurations and programming setups. We highly recommend assembling the matching physical hardware components listed in the sidebar to build along with our engineers during the course lectures.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Redirection Hook Sidebar (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {product ? (
            <div className="glassmorphism-cyan p-6 rounded-2xl border border-cyan-300 shadow-xl flex flex-col gap-4 sticky top-24">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 bg-cyan-50/60 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-200 w-fit">
                Required Hardware
              </span>
              
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide leading-snug">
                Companion Hardware Kit
              </h3>

              <div>
                <p className="text-slate-600 text-[10px] uppercase tracking-wider font-semibold">Product Model</p>
                <h4 className="font-black text-sm text-slate-900 mt-0.5">{product.name}</h4>
              </div>

              <p className="text-slate-700 text-xs leading-relaxed">
                Unlock full course capabilities by building this prototype physically. Purchase the official robotics set directly to access all sensor modules.
              </p>

              {/* Purchase button redirection */}
              <a
                href={product.external_purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 glass-btn-primary font-extrabold text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Buy Hardware Kit</span>
                <ShoppingCart className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="glassmorphism p-6 rounded-2xl border border-slate-200/30 text-center text-slate-600 text-xs py-10 uppercase tracking-wider sticky top-24">
              No companion hardware mapped to this lesson.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
