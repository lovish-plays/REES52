import "server-only";

import { getD1Database } from "../../db";

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
    const database = await getD1Database();
    const safeLimit = Math.min(100, Math.max(1, Math.round(limit)));
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
  const database = await getD1Database();
  const { results = [] } = await database
    .prepare(`${ARTICLE_SELECT} order by updated_at desc`)
    .all<ArticleRow>();
  return results.map(mapArticleRow);
}

export async function getArticleById(id: string): Promise<Article | null> {
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
