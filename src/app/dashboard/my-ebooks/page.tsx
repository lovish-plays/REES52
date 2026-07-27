import { Metadata } from "next";
import EbookCard from "@/components/lms/EbookCard";
import { getDashboardSnapshotForCurrentUser } from "@/lib/lms/data";

export const metadata: Metadata = {
  title: "My Ebooks | REES52 Academy",
};

export default async function MyEbooksPage() {
  const dashboard = await getDashboardSnapshotForCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-wide text-slate-950">My Ebooks</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {dashboard.myEbooks.map((ebook) => <EbookCard key={ebook.slug} ebook={ebook} />)}
      </div>
    </div>
  );
}
