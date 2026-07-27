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
