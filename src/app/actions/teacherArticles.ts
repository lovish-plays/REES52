"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/auth";
import { isTeacherRole } from "@/lib/auth/roles";
import {
  getArticleById,
  getTeacherArticles,
  slugifyArticle,
  type Article,
} from "@/lib/articles";
import { getD1Database } from "../../../db";

export type TeacherArticleInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImageUrl: string;
  isPublished: boolean;
};

async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || !isTeacherRole(user.role)) {
    throw new Error("Teacher access is required to manage news and articles.");
  }
  return user;
}

export async function getTeacherArticlesAction(): Promise<{
  articles?: Article[];
  error?: string;
}> {
  try {
    await requireTeacher();
    return { articles: await getTeacherArticles() };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function createTeacherArticleAction(
  input: TeacherArticleInput,
): Promise<{ article?: Article; error?: string }> {
  try {
    const user = await requireTeacher();
    const article = validateArticle(input);
    const database = await getD1Database();
    const now = new Date().toISOString();
    const id = randomUUID();

    await database
      .prepare(
        `insert into articles
          (id, title, slug, excerpt, content, category, cover_image_url, author_id, author_name, status, published_at, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        article.title,
        article.slug,
        article.excerpt,
        article.content,
        article.category,
        article.coverImageUrl || null,
        user.id,
        user.name?.trim() || "REES52 Academy Teacher",
        article.isPublished ? "published" : "draft",
        article.isPublished ? now : null,
        now,
        now,
      )
      .run();

    revalidateArticles(article.slug);
    return { article: (await getArticleById(id)) || undefined };
  } catch (error) {
    return { error: normalizeArticleError(error) };
  }
}

export async function updateTeacherArticleAction(
  input: TeacherArticleInput,
): Promise<{ article?: Article; error?: string }> {
  try {
    await requireTeacher();
    if (!input.id) return { error: "Article ID is required." };
    const article = validateArticle(input);
    const existing = await getArticleById(input.id);
    if (!existing) return { error: "Article not found." };

    const database = await getD1Database();
    const now = new Date().toISOString();
    const publishedAt = article.isPublished ? existing.publishedAt || now : null;

    await database
      .prepare(
        `update articles
         set title = ?, slug = ?, excerpt = ?, content = ?, category = ?, cover_image_url = ?,
             status = ?, published_at = ?, updated_at = ?
         where id = ?`,
      )
      .bind(
        article.title,
        article.slug,
        article.excerpt,
        article.content,
        article.category,
        article.coverImageUrl || null,
        article.isPublished ? "published" : "draft",
        publishedAt,
        now,
        input.id,
      )
      .run();

    revalidateArticles(article.slug, existing.slug);
    return { article: (await getArticleById(input.id)) || undefined };
  } catch (error) {
    return { error: normalizeArticleError(error) };
  }
}

export async function deleteTeacherArticleAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireTeacher();
    if (!id) return { error: "Article ID is required." };
    const existing = await getArticleById(id);
    if (!existing) return { error: "Article not found." };

    const database = await getD1Database();
    await database.prepare("delete from articles where id = ?").bind(id).run();
    revalidateArticles(existing.slug);
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

function validateArticle(input: TeacherArticleInput) {
  const title = input.title?.trim();
  const slug = slugifyArticle(input.slug || input.title || "");
  const excerpt = input.excerpt?.trim();
  const content = input.content?.trim();
  const category = input.category?.trim();
  const coverImageUrl = input.coverImageUrl?.trim() || "";

  if (!title || !slug || !excerpt || !content || !category) {
    throw new Error("Title, category, summary and article body are required.");
  }
  if (title.length > 160) throw new Error("Title must be 160 characters or fewer.");
  if (excerpt.length > 360) throw new Error("Summary must be 360 characters or fewer.");
  if (content.length < 120) throw new Error("Article body must contain at least 120 characters.");
  if (content.length > 50000) throw new Error("Article body must contain 50,000 characters or fewer.");
  if (category.length > 60) throw new Error("Category must be 60 characters or fewer.");
  if (coverImageUrl && !isSafeImageUrl(coverImageUrl)) {
    throw new Error("The cover image must use a secure https:// address.");
  }

  return {
    title,
    slug,
    excerpt,
    content,
    category,
    coverImageUrl,
    isPublished: Boolean(input.isPublished),
  };
}

function isSafeImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function revalidateArticles(...slugs: string[]) {
  revalidatePath("/admin/articles");
  revalidatePath("/news");
  revalidatePath("/");
  slugs.filter(Boolean).forEach((slug) => revalidatePath(`/news/${slug}`));
}

function normalizeArticleError(error: unknown) {
  const message = getErrorMessage(error);
  if (message.toLowerCase().includes("unique")) {
    return "Another article already uses this web address. Change the slug and try again.";
  }
  return message;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to manage this article.";
}
