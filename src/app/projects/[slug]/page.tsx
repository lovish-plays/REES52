import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Code2, Download, PackageCheck, PlayCircle, Timer, TriangleAlert, Wrench } from "lucide-react";
import { getProjectBySlug } from "@/lib/lms/data";
import { absoluteUrl } from "@/lib/site";
import ProjectActivityButton from "@/components/lms/ProjectActivityButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
    keywords: [project.title, project.category, project.classLevel, "robotics project", "STEM project"],
    alternates: { canonical: absoluteUrl(`/projects/${project.slug}`) },
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      url: absoluteUrl(`/projects/${project.slug}`),
      type: "article",
      images: [{ url: project.thumbnailUrl, alt: project.title }],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const projectUrl = absoluteUrl(`/projects/${project.slug}`);
  const videoEmbedUrl = toVideoEmbedUrl(project.videoUrl);
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: project.title,
    description: project.description,
    image: project.thumbnailUrl,
    totalTime: project.estimatedTime,
    video: videoEmbedUrl
      ? {
          "@type": "VideoObject",
          name: `${project.title} tutorial`,
          description: project.shortDescription,
          embedUrl: videoEmbedUrl,
          thumbnailUrl: project.thumbnailUrl,
        }
      : undefined,
    supply: project.components.map((component) => ({
      "@type": "HowToSupply",
      name: component.name,
      quantity: component.quantity,
    })),
    step: project.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Step ${index + 1}`,
      text: step,
      url: `${projectUrl}#step-${index + 1}`,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
      { "@type": "ListItem", position: 2, name: "Projects", item: absoluteUrl("/projects") },
      { "@type": "ListItem", position: 3, name: project.title, item: projectUrl },
    ],
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{project.classLevel} · {project.category}</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-wide text-slate-950 md:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">{project.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700">
              <Wrench className="h-4 w-4 text-cyan-700" />
              {project.level}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700">
              <Timer className="h-4 w-4 text-cyan-700" />
              {project.estimatedTime}
            </span>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#required-products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-500"
            >
              View Required Products
              <ArrowRight className="h-4 w-4" />
            </a>
            <ProjectActivityButton
              projectSlug={project.slug}
              type="save"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-cyan-50 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-cyan-900 sm:w-auto"
            />
          </div>
        </div>
        <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-md">
          <Image src={project.thumbnailUrl} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <aside className="min-w-0 space-y-5">
          <div id="required-products" className="scroll-mt-28">
            <Panel title="Components Required" icon={<PackageCheck className="h-5 w-5" />}>
              <div className="space-y-2">
                {project.components.map((component) => (
                <a key={component.name} href={component.productUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-cyan-50">
                  <span>{component.quantity}x {component.name}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-800">
                    Buy
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </a>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Circuit Diagram" icon={<Download className="h-5 w-5" />}>
            {project.circuitDiagramUrl && (
              <a
                href={project.circuitDiagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="relative aspect-square">
                  <Image
                    src={project.circuitDiagramUrl}
                    alt={`${project.title} circuit diagram`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-contain p-3 transition-transform group-hover:scale-[1.02]"
                  />
                </div>
                <span className="flex items-center justify-center gap-2 border-t border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-800">
                  <Download className="h-3.5 w-3.5" />
                  Open full size
                </span>
              </a>
            )}
          </Panel>

          <ProjectActivityButton
            projectSlug={project.slug}
            type="complete"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-500"
          />
        </aside>

        <main className="min-w-0 space-y-6">
          <Panel title="Overview" icon={<Wrench className="h-5 w-5" />}>
            <p className="text-sm font-medium leading-relaxed text-slate-700">{project.description}</p>
          </Panel>

          <Panel title="Step-by-Step Guide" icon={<CheckCircle2 className="h-5 w-5" />}>
            <ol className="space-y-3">
              {project.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm font-semibold text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-black text-white">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Source Code" icon={<Code2 className="h-5 w-5" />}>
            <pre className="max-h-96 max-w-full overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-cyan-50">
              <code>{project.sourceCode}</code>
            </pre>
          </Panel>

          <Panel title="Troubleshooting" icon={<TriangleAlert className="h-5 w-5" />}>
            <ul className="space-y-2">
              {project.troubleshooting.map((item) => (
                <li key={item} className="flex gap-2 text-sm font-semibold text-slate-700">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          {videoEmbedUrl && (
            <Panel title="Video Tutorial" icon={<PlayCircle className="h-5 w-5" />}>
              <div className="relative aspect-video min-w-0 max-w-full overflow-hidden rounded-xl bg-slate-950">
                <iframe
                  src={videoEmbedUrl}
                  title={`${project.title} video tutorial`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </Panel>
          )}

          <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-800 hover:text-cyan-600">
            Back to Project Library
            <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 max-w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-cyan-700">
        {icon}
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function toVideoEmbedUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
      if (url.pathname.startsWith("/embed/")) return url.toString();
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    if (url.hostname === "player.vimeo.com" || url.hostname === "iframe.mediadelivery.net") {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}
