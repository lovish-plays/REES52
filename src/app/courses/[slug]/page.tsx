import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Download, Eye, HelpCircle, PackageCheck, Trophy } from "lucide-react";
import ModuleAccordion from "@/components/lms/ModuleAccordion";
import CourseEnrollmentPanel from "@/components/lms/CourseEnrollmentPanel";
import { getCourseEnrollmentStatus } from "@/app/actions/lms";
import { getCourseBySlug } from "@/lib/lms/data";
import { absoluteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.shortDescription,
    keywords: [course.title, course.category, course.classLevel, "robotics course", "STEM learning"],
    alternates: { canonical: absoluteUrl(`/courses/${course.slug}`) },
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      url: absoluteUrl(`/courses/${course.slug}`),
      type: "article",
      images: [{ url: course.thumbnailUrl, alt: course.title }],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const firstLesson = course.modules[0]?.lessons[0]?.slug;
  const previewLesson = course.modules
    .flatMap((module) => module.lessons)
    .find((lesson) => lesson.isPreview) || course.modules[0]?.lessons[0];
  const enrollment = await getCourseEnrollmentStatus(course.slug);
  const courseUrl = absoluteUrl(`/courses/${course.slug}`);
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: courseUrl,
    image: course.thumbnailUrl,
    inLanguage: course.language,
    educationalLevel: course.classLevel,
    provider: { "@type": "Organization", name: "REES52", sameAs: absoluteUrl() },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.duration,
    },
    offers: {
      "@type": "Offer",
      price: course.price ?? 0,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: courseUrl,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
      { "@type": "ListItem", position: 2, name: "Courses", item: absoluteUrl("/courses") },
      { "@type": "ListItem", position: 3, name: course.title, item: courseUrl },
    ],
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{course.classLevel} · {course.category} Course</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-wide text-slate-950 md:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">{course.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Level", course.level],
              ["Duration", course.duration],
              ["Lessons", `${course.lessonsCount}`],
              ["Language", course.language],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <CourseEnrollmentPanel
              courseSlug={course.slug}
              firstLessonSlug={firstLesson}
              pricing={course.pricing}
              isAuthenticated={enrollment.authenticated}
              initiallyEnrolled={enrollment.enrolled}
            />
            {previewLesson && (
              <Link
                href={`/learn/${course.slug}/${previewLesson.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-sky-800 shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50"
              >
                <Eye className="h-4 w-4" />
                Preview Lesson
              </Link>
            )}
            <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-cyan-900">
              {course.pricing}{course.price ? ` - Rs. ${course.price}` : ""}
            </span>
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-md">
          <Image src={course.thumbnailUrl} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-5">
          <InfoBlock title="What You Will Build" icon={<Trophy className="h-5 w-5" />}>
            <ul className="space-y-2">
              {course.projects.length ? course.projects.map((project) => (
                <li key={project} className="flex gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                  {project}
                </li>
              )) : (
                <li className="text-sm font-semibold text-slate-700">A guided hands-on project using REES52 components.</li>
              )}
            </ul>
          </InfoBlock>

          <InfoBlock title="What You Will Learn" icon={<CheckCircle2 className="h-5 w-5" />}>
            <ul className="space-y-2">
              {course.whatYouWillLearn.map((item) => (
                <li key={item} className="flex gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                  {item}
                </li>
              ))}
            </ul>
          </InfoBlock>

          <InfoBlock title="Required Components" icon={<PackageCheck className="h-5 w-5" />}>
            <div className="space-y-2">
              {course.requiredComponents.map((component) => (
                <a key={component.name} href={component.productUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-cyan-50">
                  <span>{component.quantity}x {component.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-cyan-700" />
                </a>
              ))}
            </div>
            <a
              href={course.relatedProducts[0]?.productUrl || course.requiredComponents[0]?.productUrl || "https://rees52.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-sky-500"
            >
              Buy Course Kit
              <ArrowRight className="h-4 w-4" />
            </a>
          </InfoBlock>

          <InfoBlock title="Downloadable PDFs" icon={<Download className="h-5 w-5" />}>
            <div className="space-y-2">
              {course.downloadablePdfs.map((pdf) => (
                <div key={pdf} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">{pdf}</div>
              ))}
            </div>
          </InfoBlock>
        </aside>

        <main className="space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-700" />
              <h2 className="text-xl font-black uppercase tracking-wide text-slate-950">Course Modules</h2>
            </div>
            <ModuleAccordion course={course} />
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <InfoBlock title="Projects You Will Build" icon={<PackageCheck className="h-5 w-5" />}>
              <ul className="space-y-2 text-sm font-semibold text-slate-700">
                {course.projects.map((project) => <li key={project}>{project}</li>)}
              </ul>
            </InfoBlock>
            <InfoBlock title="Related REES52 Products" icon={<PackageCheck className="h-5 w-5" />}>
              <div className="space-y-2">
                {course.relatedProducts.map((product) => (
                  <a key={product.name} href={product.productUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-cyan-50">
                    {product.name}
                    <ArrowRight className="h-3.5 w-3.5 text-cyan-700" />
                  </a>
                ))}
              </div>
            </InfoBlock>
          </section>

          <InfoBlock title="FAQs" icon={<HelpCircle className="h-5 w-5" />}>
            <div className="space-y-3">
              {course.faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl bg-slate-50 p-4">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">{faq.question}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </InfoBlock>
        </main>
      </div>
    </div>
  );
}

function InfoBlock({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-cyan-700">
        {icon}
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}
