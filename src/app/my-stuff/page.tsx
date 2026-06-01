import Link from 'next/link';
import { getCurrentUser } from '@/app/actions/auth';
import { getEbooks, getCategories } from '@/app/actions/content';
import { BookOpen, ArrowLeft, ArrowRight, Sparkles, FileText } from 'lucide-react';
import { UnauthenticatedState } from '../my-learning/page';

export const dynamic = 'force-dynamic';

export default async function MyStuffPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <UnauthenticatedState tabName="My Stuff" />;
  }

  const allEbooks = await getEbooks();
  const categories = await getCategories();
  const unlockedEbooks = allEbooks.filter(e => currentUser.purchased_ebooks.includes(e.id));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6 text-slate-800 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 pb-4 gap-4">
        <div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-800 hover:text-cyan-700 transition-colors uppercase tracking-wider font-extrabold mb-2 w-fit">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explorer
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-slate-900 uppercase">
            My Unlocked Ebooks
          </h1>
          <p className="text-xs text-slate-700 uppercase tracking-widest font-bold mt-1">
            Access your library of unlocked engineering guides.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-xl w-fit backdrop-blur-sm shadow-sm">
          <Sparkles className="w-4 h-4 text-slate-800" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {unlockedEbooks.length} Unlocked Book{unlockedEbooks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid List */}
      {unlockedEbooks.length === 0 ? (
        <div className="py-20 text-center glassmorphism rounded-2xl border border-slate-200/30 flex flex-col items-center justify-center gap-4">
          <BookOpen className="w-12 h-12 text-slate-500 animate-pulse" />
          <h3 className="text-slate-800 uppercase tracking-widest text-sm font-black">No unlocked ebooks yet</h3>
          <p className="text-slate-700 text-xs max-w-xs leading-relaxed font-bold">
            Head back to the explorer feed and click &quot;Unlock Ebook&quot; on any textbook item to add it here!
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 glass-btn-cyan text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer"
          >
            Explore Ebook Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {unlockedEbooks.map((book) => {
            const cat = categories.find(c => c.id === book.category_id);
            return (
              <div
                key={book.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glassmorphism hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300 bg-white/70"
              >
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-250 uppercase tracking-widest">
                        <BookOpen className="w-2.5 h-2.5 text-cyan-600" /> Unlocked
                      </span>
                      {cat && (
                        <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-wider truncate max-w-[120px]">
                          {cat.name}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug">
                      {book.title}
                    </h3>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-[10px] text-slate-700 font-bold uppercase tracking-wider">
                    <span>Ebook PDF</span>
                    <span className="text-cyan-700 flex items-center gap-1 font-black">
                      Open <FileText className="w-3 h-3 text-cyan-600" />
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/40 border-t border-slate-200/50 flex flex-col gap-2 backdrop-blur-sm">
                  <Link
                    href={`/ebooks/${book.id}`}
                    className="w-full py-2.5 glass-btn-cyan font-black text-xs uppercase tracking-widest rounded-lg text-center flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Read Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
