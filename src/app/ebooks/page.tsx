import { Metadata } from "next";
import EbookCard from "@/components/lms/EbookCard";
import { getEbooks } from "@/lib/lms/data";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Robotics & Electronics Ebooks",
  description: "Download Arduino guides, robotics manuals, sensor guides, IoT notes, ATL lab manuals, 3D printing guides, and AI notes.",
  alternates: { canonical: absoluteUrl("/ebooks") },
};

const categories = [
  "Arduino Guides",
  "Robotics Manuals",
  "Sensor Guides",
  "IoT Notes",
  "ATL Lab Manuals",
  "3D Printing Guides",
  "AI / ML Notes",
];

export default async function EbooksPage() {
  const ebooks = await getEbooks();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="border-b border-slate-200/70 pb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Ebook Library</p>
        <h1 className="mt-3 text-balance text-3xl font-black tracking-wide text-slate-950 md:text-5xl">
          Guides, manuals, notes, and lab material
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-sm font-semibold leading-relaxed text-slate-600">
          Preview and download practical notes, lab manuals, wiring guides, and project worksheets.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ebooks.map((ebook) => (
          <EbookCard key={ebook.slug} ebook={ebook} />
        ))}
      </div>
    </div>
  );
}
