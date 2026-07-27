import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const leaderboardEvents = sqliteTable(
  "leaderboard_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    displayName: text("display_name").notNull(),
    activityType: text("activity_type").notNull(),
    activityKey: text("activity_key").notNull(),
    points: integer("points").notNull(),
    monthKey: text("month_key").notNull(),
    earnedAt: text("earned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("leaderboard_events_user_activity_unique").on(table.userId, table.activityKey),
    index("leaderboard_events_month_points_idx").on(table.monthKey, table.points),
    index("leaderboard_events_user_month_idx").on(table.userId, table.monthKey),
  ],
);

export const articles = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(),
    coverImageUrl: text("cover_image_url"),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("articles_slug_unique").on(table.slug),
    index("articles_status_published_idx").on(table.status, table.publishedAt),
    index("articles_author_idx").on(table.authorId),
  ],
);
