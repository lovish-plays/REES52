"use client";

import { useState, useTransition } from "react";
import { Eye, FileText, Pencil, Plus, Send, Trash2, X } from "lucide-react";
import {
  createTeacherArticleAction,
  deleteTeacherArticleAction,
  updateTeacherArticleAction,
  type TeacherArticleInput,
} from "@/app/actions/teacherArticles";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { formatArticleDate } from "@/components/news/ArticleCard";
import type { Article } from "@/lib/articles";

const emptyForm: TeacherArticleInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  coverImageUrl: "",
  isPublished: false,
};

export default function TeacherArticleManager({
  initialArticles,
}: {
  initialArticles: Article[];
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [form, setForm] = useState<TeacherArticleInput>(emptyForm);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(form.id);

  function update<K extends keyof TeacherArticleInput>(field: K, value: TeacherArticleInput[K]) {
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

  function saveArticle() {
    setMessage("");
    startTransition(async () => {
      const result = isEditing
        ? await updateTeacherArticleAction(form)
        : await createTeacherArticleAction(form);

      if (result.error || !result.article) {
        setMessage(result.error || "Unable to save this article.");
        return;
      }

      setArticles((current) =>
        isEditing
          ? current.map((item) => (item.id === result.article!.id ? result.article! : item))
          : [result.article!, ...current],
      );
      setForm(emptyForm);
      setMessage(
        result.article.status === "published"
          ? isEditing
            ? "Article updated and published."
            : "Article published for everyone."
          : isEditing
            ? "Draft updated."
            : "Draft saved.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function editArticle(article: Article) {
    setForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      coverImageUrl: article.coverImageUrl,
      isPublished: article.status === "published",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeArticle(article: Article) {
    if (!window.confirm(`Permanently delete “${article.title}”?`)) return;
    setMessage("");
    startTransition(async () => {
      const result = await deleteTeacherArticleAction(article.id);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setArticles((current) => current.filter((item) => item.id !== article.id));
      if (form.id === article.id) setForm(emptyForm);
      setMessage("Article deleted.");
    });
  }

  const canSave =
    form.title.trim() &&
    form.slug.trim() &&
    form.excerpt.trim() &&
    form.content.trim().length >= 120 &&
    form.category.trim();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="border-b border-slate-200 pb-7">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Teacher Studio</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">News &amp; Articles</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
          Write Academy news, classroom updates, tutorials and teaching notes. Save privately as a draft or publish for every visitor.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              {isEditing ? "Edit article" : "New article"}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {isEditing ? "Update this post" : "Create a public post"}
            </h2>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
          <div className="grid gap-5">
            <Field label="Article title">
              <input
                value={form.title}
                onChange={(event) => updateTitle(event.target.value)}
                maxLength={160}
                placeholder="Example: Five ways to debug an Arduino project"
                className={inputClass}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                <input
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  maxLength={60}
                  placeholder="Academy News"
                  className={inputClass}
                />
              </Field>
              <Field label="Web address">
                <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-100">
                  <span className="flex items-center bg-slate-50 px-3 text-xs font-bold text-slate-500">/news/</span>
                  <input
                    value={form.slug}
                    onChange={(event) => update("slug", slugify(event.target.value))}
                    maxLength={120}
                    placeholder="article-name"
                    className="min-w-0 flex-1 px-3 py-3 text-sm font-semibold text-slate-950 outline-none"
                  />
                </div>
              </Field>
            </div>
            <Field label="Short summary">
              <textarea
                value={form.excerpt}
                onChange={(event) => update("excerpt", event.target.value)}
                maxLength={360}
                rows={3}
                placeholder="A concise preview shown on the News page."
                className={`${inputClass} resize-y leading-relaxed`}
              />
              <span className="text-right text-[10px] font-semibold text-slate-400">{form.excerpt.length}/360</span>
            </Field>
          </div>
          <AdminImageUpload
            label="Cover image (optional)"
            value={form.coverImageUrl}
            onChange={(url) => update("coverImageUrl", url)}
            scope="articles"
          />
        </div>

        <Field label="Article body" className="mt-5">
          <textarea
            value={form.content}
            onChange={(event) => update("content", event.target.value)}
            maxLength={50000}
            rows={16}
            placeholder={"Write the complete article here.\n\nSeparate paragraphs with a blank line. Start a section heading with ## followed by the heading text."}
            className={`${inputClass} resize-y font-medium leading-7`}
          />
          <span className="text-xs font-medium text-slate-500">
            Minimum 120 characters. Use blank lines between paragraphs and <strong>## Heading</strong> for section headings.
          </span>
        </Field>

        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => update("isPublished", event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-600"
            />
            <span>
              <span className="block text-xs font-black text-slate-900">Publish for everyone</span>
              <span className="mt-1 block text-xs font-medium text-slate-500">
                Leave unchecked to keep this article private in Teacher Studio.
              </span>
            </span>
          </label>
          <button
            type="button"
            onClick={saveArticle}
            disabled={isPending || !canSave}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.isPublished ? <Send className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            {isPending ? "Saving..." : form.isPublished ? "Save & publish" : "Save draft"}
          </button>
        </div>

        {message && (
          <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800" role="status">
            {message}
          </p>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Publication desk</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Your posts</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
            {articles.length} {articles.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {articles.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <article key={article.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                        article.status === "published"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {article.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {article.status === "published" && (
                      <a
                        href={`/news/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-sky-700 hover:bg-sky-50"
                        aria-label={`View ${article.title}`}
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => editArticle(article)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      aria-label={`Edit ${article.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeArticle(article)}
                      disabled={isPending}
                      className="rounded-lg p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      aria-label={`Delete ${article.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-black leading-tight text-slate-950">{article.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{article.excerpt}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>{article.readTimeMinutes} min read</span>
                  <span>Updated {formatArticleDate(article.updatedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <Plus className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-black text-slate-800">No articles have been created yet.</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Use the editor above to save the first draft.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-xs font-black text-slate-800 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";
