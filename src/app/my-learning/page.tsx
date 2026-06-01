import Link from 'next/link';
import { getCurrentUser } from '@/app/actions/auth';
import { getVideos, getCategories } from '@/app/actions/content';
import { Play, ArrowLeft, ArrowRight, Video, Sparkles, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <UnauthenticatedState tabName="My Learning" />;
  }

  const allVideos = await getVideos();
  const categories = await getCategories();
  const enrolledVideos = allVideos.filter(v => currentUser.enrolled_videos.includes(v.id));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6 text-slate-800 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 pb-4 gap-4">
        <div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-800 hover:text-cyan-700 transition-colors uppercase tracking-wider font-extrabold mb-2 w-fit">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explorer
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-slate-900 uppercase">
            My Learning Lectures
          </h1>
          <p className="text-xs text-slate-700 uppercase tracking-widest font-bold mt-1">
            Access your saved & enrolled video lessons.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-xl w-fit backdrop-blur-sm shadow-sm">
          <Sparkles className="w-4 h-4 text-slate-800" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {enrolledVideos.length} Enrolled Module{enrolledVideos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid List */}
      {enrolledVideos.length === 0 ? (
        <div className="py-20 text-center glassmorphism rounded-2xl border border-slate-200/30 flex flex-col items-center justify-center gap-4">
          <Video className="w-12 h-12 text-slate-500 animate-pulse" />
          <h3 className="text-slate-800 uppercase tracking-widest text-sm font-black">No enrolled lectures yet</h3>
          <p className="text-slate-700 text-xs max-w-xs leading-relaxed font-bold">
            Head back to the explorer feed and click &quot;Enroll Free&quot; on any video module to populate your dashboard!
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 glass-btn-cyan text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer"
          >
            Explore Video Lectures
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {enrolledVideos.map((video) => {
            const cat = categories.find(c => c.id === video.category_id);
            return (
              <div
                key={video.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glassmorphism hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300 bg-white/70"
              >
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-250 uppercase tracking-widest">
                        <Play className="w-2.5 h-2.5 text-blue-700 fill-blue-700" /> Enrolled
                      </span>
                      {cat && (
                        <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-wider truncate max-w-[120px]">
                          {cat.name}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug">
                      {video.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-700 font-bold uppercase tracking-wider">
                    <span>Video Lecture</span>
                    <span className="text-cyan-700 flex items-center gap-1 font-black">
                      Ready <Play className="w-3 h-3 text-cyan-600 fill-cyan-600 animate-pulse" />
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/40 border-t border-slate-200/50 flex flex-col gap-2 backdrop-blur-sm">
                  <Link
                    href={`/videos/${video.id}`}
                    className="w-full py-2 glass-btn-cyan font-black text-xs uppercase tracking-widest rounded-lg text-center flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Watch Preview</span>
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

export function UnauthenticatedState({ tabName }: { tabName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh] text-slate-800">
      <div className="p-8 bg-red-50/30 border border-red-200/60 rounded-2xl mb-4 max-w-sm text-center">
        <GraduationCap className="w-12 h-12 text-cyan-600 mx-auto mb-2" />
        <h3 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider">Authentication Required</h3>
        <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">
          Please sign in or register an account using the navigation header button to unlock {tabName} capabilities.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
      >
        Return to Home Explorer
      </Link>
    </div>
  );
}
