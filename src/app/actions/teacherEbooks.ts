"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/auth";
import { isTeacherRole } from "@/lib/auth/roles";
import {
  deleteLocalEbook,
  getLocalEbooks,
  isLocalEbookPublished,
  upsertLocalEbook,
} from "@/lib/lms/local-content-store";
import type { LmsEbook, LmsLevel } from "@/lib/lms/types";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";
import { createClient } from "@/lib/supabaseServer";

export type TeacherEbook = LmsEbook & {
  id: string;
  isPublished: boolean;
};

export type TeacherEbookInput = Omit<TeacherEbook, "id"> & { id?: string };

type EbookRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  level: string | null;
  cover_url: string | null;
  file_url: string | null;
  pages: number | string | null;
  is_free: boolean | null;
  is_published: boolean | null;
};

async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || !isTeacherRole(user.role)) {
    throw new Error("Teacher access is required to manage ebooks.");
  }
}

export async function getTeacherEbooksAction(): Promise<{
  ebooks?: TeacherEbook[];
  error?: string;
}> {
  try {
    await requireTeacher();

    if (!hasSupabaseEnv) {
      return { ebooks: getLocalEbooks(true).map(mapLocalEbook) };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ebooks")
      .select("id,title,slug,description,category,level,cover_url,file_url,pages,is_free,is_published")
      .order("updated_at", { ascending: false });

    if (error) return { error: error.message };
    return { ebooks: ((data || []) as EbookRow[]).map(mapEbookRow) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function createEbookAction(
  input: TeacherEbookInput,
): Promise<{ ebook?: TeacherEbook; error?: string }> {
  try {
    await requireTeacher();
    const ebook = validateEbookInput(input);

    if (!hasSupabaseEnv) {
      if (getLocalEbooks(true).some((item) => item.slug === ebook.slug)) {
        return { error: "An ebook with this web address already exists." };
      }

      const localEbook: LmsEbook = { ...ebook, id: randomUUID() };
      upsertLocalEbook(localEbook, ebook.isPublished);
      revalidateEbooks(ebook.slug);
      return { ebook: mapLocalEbook(localEbook) };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ebooks")
      .insert(toEbookRow(ebook))
      .select("id,title,slug,description,category,level,cover_url,file_url,pages,is_free,is_published")
      .single();

    if (error) return { error: normalizeEbookError(error.message) };
    revalidateEbooks(ebook.slug);
    return { ebook: mapEbookRow(data as EbookRow) };
  } catch (error) {
    return { error: normalizeEbookError(getErrorMessage(error)) };
  }
}

export async function updateEbookAction(
  input: TeacherEbookInput,
): Promise<{ ebook?: TeacherEbook; error?: string }> {
  try {
    await requireTeacher();
    if (!input.id) return { error: "Ebook ID is required." };
    const ebook = validateEbookInput(input);

    if (!hasSupabaseEnv) {
      const ebooks = getLocalEbooks(true);
      const existing = ebooks.find((item) => (item.id || item.slug) === input.id);
      if (!existing) return { error: "Ebook not found." };
      if (
        ebooks.some(
          (item) => (item.id || item.slug) !== input.id && item.slug === ebook.slug,
        )
      ) {
        return { error: "An ebook with this web address already exists." };
      }

      const updated: LmsEbook = { ...ebook, id: existing.id || input.id };
      upsertLocalEbook(updated, ebook.isPublished);
      revalidateEbooks(ebook.slug, existing.slug);
      return { ebook: mapLocalEbook(updated) };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("ebooks")
      .select("slug")
      .eq("id", input.id)
      .maybeSingle();
    const { data, error } = await supabase
      .from("ebooks")
      .update(toEbookRow(ebook))
      .eq("id", input.id)
      .select("id,title,slug,description,category,level,cover_url,file_url,pages,is_free,is_published")
      .single();

    if (error) return { error: normalizeEbookError(error.message) };
    revalidateEbooks(ebook.slug, existing?.slug || "");
    return { ebook: mapEbookRow(data as EbookRow) };
  } catch (error) {
    return { error: normalizeEbookError(getErrorMessage(error)) };
  }
}

export async function deleteEbookAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireTeacher();
    if (!id) return { error: "Ebook ID is required." };

    if (!hasSupabaseEnv) {
      const removed = deleteLocalEbook(id);
      if (!removed) return { error: "Ebook not found." };
      revalidateEbooks(removed.slug);
      return { success: true };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("ebooks")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    const { error } = await supabase.from("ebooks").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidateEbooks(existing?.slug || "");
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

function validateEbookInput(input: TeacherEbookInput): Omit<TeacherEbook, "id"> {
  const title = input.title?.trim();
  const slug = slugify(input.slug || input.title || "");
  const description = input.description?.trim() || "";
  const category = input.category?.trim();
  const coverUrl = input.coverUrl?.trim() || "";
  const fileUrl = input.fileUrl?.trim() || "";
  const pages = Math.min(5000, Math.max(0, Math.round(Number(input.pages) || 0)));
  const level: LmsLevel =
    input.level === "Intermediate" || input.level === "Advanced"
      ? input.level
      : "Beginner";
  const isPublished = Boolean(input.isPublished);

  if (!title || !slug || !category) {
    throw new Error("Title, web address and category are required.");
  }
  if (title.length > 160) throw new Error("Title must be 160 characters or fewer.");
  if (description.length > 1500) {
    throw new Error("Description must be 1,500 characters or fewer.");
  }
  if (coverUrl && !isSafeAssetUrl(coverUrl)) {
    throw new Error("Cover image must use a secure https:// address or a site path beginning with /. ");
  }
  if (fileUrl && !isSafePdfUrl(fileUrl)) {
    throw new Error("Ebook file must be a secure https:// or site PDF address ending in .pdf.");
  }
  if (isPublished) {
    if (description.length < 60) {
      throw new Error("Published ebooks need a description of at least 60 characters.");
    }
    if (pages < 4) throw new Error("Published ebooks must contain at least 4 pages.");
    if (!coverUrl) throw new Error("Published ebooks need a cover image.");
    if (!fileUrl) throw new Error("Published ebooks need a PDF file address.");
  }

  return {
    title,
    slug,
    description,
    category,
    pages,
    level,
    coverUrl,
    fileUrl,
    isFree: Boolean(input.isFree),
    isPublished,
  };
}

function toEbookRow(ebook: Omit<TeacherEbook, "id">) {
  return {
    title: ebook.title,
    slug: ebook.slug,
    description: ebook.description || null,
    category: ebook.category,
    level: ebook.level,
    cover_url: ebook.coverUrl || null,
    file_url: ebook.fileUrl || null,
    pdf_url: ebook.fileUrl || null,
    pages: ebook.pages,
    is_free: ebook.isFree,
    is_published: ebook.isPublished,
    updated_at: new Date().toISOString(),
  };
}

function mapEbookRow(row: EbookRow): TeacherEbook {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || slugify(row.title),
    description: row.description || "",
    category: row.category || "Ebook Guides",
    pages: Math.max(0, Math.round(Number(row.pages) || 0)),
    level: normalizeLevel(row.level),
    coverUrl: row.cover_url || "",
    fileUrl: row.file_url || "",
    isFree: row.is_free !== false,
    isPublished: Boolean(row.is_published),
  };
}

function mapLocalEbook(ebook: LmsEbook): TeacherEbook {
  return {
    ...ebook,
    id: ebook.id || ebook.slug,
    isPublished: isLocalEbookPublished(ebook),
  };
}

function normalizeLevel(value?: string | null): LmsLevel {
  if (value === "Intermediate" || value === "Advanced") return value;
  return "Beginner";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isSafeAssetUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isSafePdfUrl(value: string) {
  return isSafeAssetUrl(value) && value.toLowerCase().split(/[?#]/)[0].endsWith(".pdf");
}

function revalidateEbooks(...slugs: string[]) {
  revalidatePath("/admin/ebooks");
  revalidatePath("/ebooks");
  revalidatePath("/");
  slugs.filter(Boolean).forEach((slug) => revalidatePath(`/ebooks/${slug}`));
}

function normalizeEbookError(message: string) {
  if (message.toLowerCase().includes("unique")) {
    return "Another ebook already uses this web address. Change the slug and try again.";
  }
  return message;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to manage ebook content.";
}
