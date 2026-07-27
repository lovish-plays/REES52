import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export default function AdminStatCard({
  title,
  value,
  href,
  icon,
}: {
  title: string;
  value: number | string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-cyan-700">
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-cyan-700" />
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </Link>
  );
}
