import "server-only";

import { getD1Database } from "../../db";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";
import { createClient } from "@/lib/supabaseServer";

export type ArticleStatus = "draft" | "published";

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImageUrl: string;
  authorId: string;
  authorName: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readTimeMinutes: number;
};

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImageUrl: string | null;
  authorId: string;
  authorName: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SupabaseArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  author_id: string | null;
  author_name: string;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const SUPABASE_ARTICLE_COLUMNS =
  "id,title,slug,excerpt,content,category,cover_image_url,author_id,author_name,status,published_at,created_at,updated_at";

const ARTICLE_SELECT = `select
  id,
  title,
  slug,
  excerpt,
  content,
  category,
  cover_image_url as coverImageUrl,
  author_id as authorId,
  author_name as authorName,
  status,
  published_at as publishedAt,
  created_at as createdAt,
  updated_at as updatedAt
from articles`;

export async function getPublishedArticles(limit = 24): Promise<Article[]> {
  try {
    const safeLimit = Math.min(100, Math.max(1, Math.round(limit)));

    if (hasSupabaseEnv) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("articles")
        .select(SUPABASE_ARTICLE_COLUMNS)
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(safeLimit);

      if (error) throw new Error(error.message);
      return ((data || []) as SupabaseArticleRow[]).map(mapSupabaseArticleRow);
    }

    const database = await getD1Database();
    const { results = [] } = await database
      .prepare(
        `${ARTICLE_SELECT}
         where status = 'published' and published_at is not null
         order by published_at desc
         limit ?`,
      )
      .bind(safeLimit)
      .all<ArticleRow>();

    return results.map(mapArticleRow);
  } catch {
    return [];
  }
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  try {
    if (hasSupabaseEnv) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("articles")
        .select(SUPABASE_ARTICLE_COLUMNS)
        .eq("slug", slug)
        .eq("status", "published")
        .not("published_at", "is", null)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data ? mapSupabaseArticleRow(data as SupabaseArticleRow) : null;
    }

    const database = await getD1Database();
    const { results = [] } = await database
      .prepare(
        `${ARTICLE_SELECT}
         where slug = ? and status = 'published' and published_at is not null
         limit 1`,
      )
      .bind(slug)
      .all<ArticleRow>();

    return results[0] ? mapArticleRow(results[0]) : null;
  } catch {
    return null;
  }
}

export async function getTeacherArticles(): Promise<Article[]> {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(SUPABASE_ARTICLE_COLUMNS)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return ((data || []) as SupabaseArticleRow[]).map(mapSupabaseArticleRow);
  }

  const database = await getD1Database();
  const { results = [] } = await database
    .prepare(`${ARTICLE_SELECT} order by updated_at desc`)
    .all<ArticleRow>();
  return results.map(mapArticleRow);
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(SUPABASE_ARTICLE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapSupabaseArticleRow(data as SupabaseArticleRow) : null;
  }

  const database = await getD1Database();
  const { results = [] } = await database
    .prepare(`${ARTICLE_SELECT} where id = ? limit 1`)
    .bind(id)
    .all<ArticleRow>();
  return results[0] ? mapArticleRow(results[0]) : null;
}

export function slugifyArticle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function mapArticleRow(row: ArticleRow): Article {
  return {
    ...row,
    coverImageUrl: row.coverImageUrl || "",
    readTimeMinutes: estimateReadTime(row.content),
  };
}

function mapSupabaseArticleRow(row: SupabaseArticleRow): Article {
  return mapArticleRow({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    coverImageUrl: row.cover_image_url,
    authorId: row.author_id || "",
    authorName: row.author_name,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
