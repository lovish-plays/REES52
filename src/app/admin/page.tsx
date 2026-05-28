import Link from 'next/link';
import { getCurrentUser } from '@/app/actions/auth';
import { getCategories, getProducts, getEbooks, getVideos, getWebinars } from '@/app/actions/content';
import AdminDashboard from '@/components/AdminDashboard';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  // Security Role Enforcement Guard
  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[70vh] bg-[#F7F4EB] text-slate-800">
        <div className="max-w-md w-full p-8 glassmorphism border border-red-200 rounded-2xl flex flex-col items-center gap-4 shadow-xl">
          <div className="p-3 bg-red-50 border border-red-200 rounded-full text-red-600 animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-red-600">
            SECURE ACCESS DENIED
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed uppercase tracking-wider font-semibold">
            This route is strictly restricted to administrator privileges. Please sign in with an administrator account to access this area.
          </p>
          <Link
            href="/"
            className="mt-4 px-6 py-2.5 glass-btn-cyan font-bold uppercase text-[10px] tracking-widest rounded-xl w-full text-center"
          >
            Return to Public Explorer
          </Link>
        </div>
      </div>
    );
  }

  // Fetch Database tables for dashboard CRUD operations
  const categories = await getCategories();
  const products = await getProducts();
  const ebooks = await getEbooks();
  const videos = await getVideos();
  const webinars = await getWebinars();

  return (
    <div className="flex-1 flex flex-col bg-[#F7F4EB]">
      {/* Admin back button header banner */}
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-cyan-600 transition-colors uppercase tracking-wider font-bold w-fit">
          <ArrowLeft className="w-4 h-4" /> Exit Console
        </Link>
      </div>

      <AdminDashboard
        categories={categories}
        products={products}
        ebooks={ebooks}
        videos={videos}
        webinars={webinars}
      />
    </div>
  );
}
