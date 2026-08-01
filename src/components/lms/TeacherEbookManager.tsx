"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  createEbookAction,
  deleteEbookAction,
  updateEbookAction,
  type TeacherEbook,
  type TeacherEbookInput,
} from "@/app/actions/teacherEbooks";
import AdminImageUpload from "@/components/admin/AdminImageUpload";

const emptyForm: TeacherEbookInput = {
  title: "",
  slug: "",
  description: "",
  category: "",
  pages: 0,
  level: "Beginner",
  coverUrl: "",
  fileUrl: "",
  isFree: true,
  isPublished: false,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100";
const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-600";

export default function TeacherEbookManager({
  initialEbooks,
}: {
  initialEbooks: TeacherEbook[];
}) {
  const [ebooks, setEbooks] = useState(initialEbooks);
  const [form, setForm] = useState<TeacherEbookInput>(emptyForm);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(form.id);

  function update<K extends keyof TeacherEbookInput>(field: K, value: TeacherEbookInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: current.id ? current.slug : slugify(title),
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setMessage("");
  }

  function saveEbook() {
    setMessage("");
    startTransition(async () => {
      const result = isEditing
        ? await updateEbookAction(form)
        : await createEbookAction(form);

      if (result.error || !result.ebook) {
        setMessage(result.error || "Unable to save this ebook.");
        return;
      }

      setEbooks((current) =>
        isEditing
          ? current.map((item) => (item.id === result.ebook!.id ? result.ebook! : item))
          : [result.ebook!, ...current],
      );
      setForm(emptyForm);
      setMessage(
        result.ebook.isPublished
          ? isEditing
            ? "Ebook updated and published."
            : "Ebook published for students and teachers."
          : isEditing
            ? "Ebook draft updated."
            : "Ebook draft created.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function editEbook(ebook: TeacherEbook) {
    setForm({ ...ebook });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeEbook(ebook: TeacherEbook) {
    if (!window.confirm(`Permanently delete "${ebook.title}"?`)) return;

    setMessage("");
    startTransition(async () => {
      const result = await deleteEbookAction(ebook.id);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setEbooks((current) => current.filter((item) => item.id !== ebook.id));
      if (form.id === ebook.id) setForm(emptyForm);
      setMessage("Ebook deleted.");
    });
  }

  const canSave = Boolean(
    form.title.trim() &&
      form.slug.trim() &&
      form.category.trim() &&
      (!form.isPublished ||
        (form.description.trim().length >= 60 &&
          Number(form.pages) >= 4 &&
          form.coverUrl.trim() &&
          form.fileUrl.trim())),
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Teacher Studio</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Ebooks</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
            Create downloadable study guides, keep unfinished work private, and publish completed PDFs for students and teachers.
          </p>
        </div>
        <Link
          href="/ebooks"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-800 hover:border-cyan-300 hover:text-cyan-700"
        >
          <BookOpen className="h-4 w-4" />
          View public library
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              {isEditing ? "Edit ebook" : "New ebook"}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {isEditing ? "Update this study guide" : "Add a downloadable study guide"}
            </h2>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancel edit
            </button>
          )}
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Ebook title
            <input
              aria-label="Ebook title"
              value={form.title}
              onChange={(event) => updateTitle(event.target.value)}
              className={inputClass}
              maxLength={160}
              placeholder="Arduino Sensor Lab Workbook"
            />
          </label>
          <label className={labelClass}>
            Web address
            <input
              aria-label="Ebook web address"
              value={form.slug}
              onChange={(event) => update("slug", slugify(event.target.value))}
              className={inputClass}
              placeholder="arduino-sensor-lab-workbook"
            />
          </label>
          <label className={labelClass}>
            Category
            <input
              aria-label="Ebook category"
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
              className={inputClass}
              placeholder="Arduino Guides"
            />
          </label>
          <label className={labelClass}>
            Difficulty level
            <select
              aria-label="Ebook difficulty level"
              value={form.level}
              onChange={(event) =>
                update("level", event.target.value as TeacherEbookInput["level"])
              }
              className={inputClass}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label className={labelClass}>
            Number of pages
            <input
              aria-label="Number of pages"
              type="number"
              min={0}
              max={5000}
              value={form.pages}
              onChange={(event) => update("pages", Number(event.target.value))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            PDF file address
            <input
              aria-label="PDF file address"
              value={form.fileUrl}
              onChange={(event) => update("fileUrl", event.target.value)}
              className={inputClass}
              placeholder="/downloads/arduino-workbook.pdf"
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Description
            <textarea
              aria-label="Ebook description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className={`${inputClass} min-h-28 resize-y`}
              maxLength={1500}
              placeholder="Explain what students will learn, build, and submit. Published descriptions require at least 60 characters."
            />
          </label>

          <div className="md:col-span-2">
            <AdminImageUpload
              label="Ebook cover image"
              value={form.coverUrl}
              onChange={(url) => update("coverUrl", url)}
              scope="ebook-covers"
            />
            <label className={`${labelClass} mt-4 block`}>
              Or enter a cover image address
              <input
                aria-label="Cover image address"
                value={form.coverUrl}
                onChange={(event) => update("coverUrl", event.target.value)}
                className={inputClass}
                placeholder="https://... or /diagrams/cover.png"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(event) => update("isFree", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-cyan-700"
            />
            <span>
              <span className="block text-xs font-black text-slate-900">Free download for everyone</span>
              <span className="mt-1 block text-xs font-semibold text-slate-600">
                Turn this off to show the ebook publicly while requiring sign-in to access it.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => update("isPublished", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-cyan-700"
            />
            <span>
              <span className="block text-xs font-black text-slate-900">Publish for students and teachers</span>
              <span className="mt-1 block text-xs font-semibold text-slate-600">
                Leave unchecked to keep this ebook as a private Teacher Studio draft.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveEbook}
            disabled={!canSave || isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isPending ? "Saving..." : isEditing ? "Save changes" : "Add ebook"}
          </button>
          <p className="text-xs font-semibold text-slate-500">
            Drafts may be incomplete. Published ebooks require a 4+ page PDF, cover, and complete description.
          </p>
        </div>

        {message && (
          <p
            role="status"
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${
              /unable|error|required|need|must|already|not found/i.test(message)
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
            }`}
          >
            {message}
          </p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Library management</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Published ebooks and private drafts</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
            {ebooks.length} total
          </span>
        </div>

        {ebooks.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {ebooks.map((ebook) => (
              <article key={ebook.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest">
                      <span className={ebook.isPublished ? "text-emerald-700" : "text-amber-700"}>
                        {ebook.isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="text-slate-500">{ebook.isFree ? "Free" : "Login required"}</span>
                      <span className="text-slate-500">{ebook.pages} pages</span>
                    </div>
                    <h3 className="mt-2 text-lg font-black text-slate-950">{ebook.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-600">
                      {ebook.description || "No description added yet."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => editEbook(ebook)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {ebook.fileUrl && (
                    <a
                      href={ebook.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open PDF
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeEbook(ebook)}
                    disabled={isPending}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <FileText className="mx-auto h-9 w-9 text-slate-400" />
            <p className="mt-3 text-sm font-black text-slate-800">No ebooks yet</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Use the form above to create the first study guide.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
