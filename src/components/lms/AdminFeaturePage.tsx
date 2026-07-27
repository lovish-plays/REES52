import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AdminFeaturePage({
  title,
  description,
  features,
  primaryAction,
}: {
  title: string;
  description: string;
  features: string[];
  primaryAction?: { label: string; href: string };
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <Link href="/admin" className="inline-flex w-fit items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-800 hover:text-cyan-600">
        <ArrowLeft className="h-4 w-4" />
        Teacher Dashboard
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Teacher Studio</p>
        <h1 className="mt-3 text-3xl font-black tracking-wide text-slate-950 md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">{description}</p>
        {primaryAction && (
          <Link
            href={primaryAction.href}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-cyan-700"
          >
            {primaryAction.label}
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
            <p className="text-sm font-bold leading-relaxed text-slate-700">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
