import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEbookById, getProductById } from '@/app/actions/content';
import { ArrowLeft, BookOpen, ExternalLink, ShoppingCart, Info } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EbookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ebook = await getEbookById(id);

  if (!ebook) {
    notFound();
  }

  // Fetch mapped parent hardware product
  const product = ebook.parent_product_id ? await getProductById(ebook.parent_product_id) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6 text-slate-800">
      
      {/* Back Button */}
      <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors w-fit text-xs font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explorer</span>
      </Link>

      {/* Grid Layout: 75% (9 cols) / 25% (3 cols) on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Ebook PDF Reader (9 cols = 75% width) */}
        <div className="lg:col-span-9 flex flex-col gap-6 w-full">
          
          <div className="glassmorphism p-5 rounded-2xl border border-slate-200/50 flex flex-col gap-4 shadow-md">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-wide">
              {ebook.title}
            </h1>
            <p className="text-slate-600 text-xs uppercase tracking-widest flex items-center gap-2 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600"></span>
              Interactive PDF Document Reader
            </p>

            {/* Inline PDF Viewer Frame */}
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                src={`${ebook.pdf_url}#toolbar=0&navpanes=0`}
                className="w-full h-full"
                title={ebook.title}
              ></iframe>
            </div>

            {/* Download/Fullscreen Helper link */}
            <a
              href={ebook.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-3 glass-btn-cyan font-extrabold text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Open Document in Full Window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Reader hints context card */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-200/30 text-slate-700">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-cyan-600 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Reader Instructions
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Use the document reader navigation bar to scroll, zoom, or jump to page index chapters. Standard course files include circuit schematics, pinout connections, and sample code blocks designed specifically for matching hardware.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Redirection Hook Sidebar (3 cols = 25% width) */}
        <div className="lg:col-span-3 flex flex-col gap-6 w-full">
          {product ? (
            <div className="glassmorphism-cyan p-6 rounded-2xl border border-cyan-300 shadow-xl flex flex-col gap-4 sticky top-24">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 bg-cyan-50/60 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-200 w-fit">
                Hardware Link
              </span>
              
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide leading-snug">
                Companion Hardware Kit
              </h3>

              <div>
                <p className="text-slate-600 text-[10px] uppercase tracking-wider font-semibold">Product Model</p>
                <h4 className="font-black text-sm text-slate-900 mt-0.5">{product.name}</h4>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                Purchase this official hardware package directly to complete the practical modules outlined in this Ebook guide.
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
            <div className="glassmorphism p-6 rounded-2xl border border-slate-200/30 text-center text-slate-500 text-xs py-10 uppercase tracking-wider sticky top-24">
              No companion hardware mapped to this ebook.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
