import "server-only";

import { randomUUID } from "crypto";
import { getD1Database } from "../../../db";

export const LEADERBOARD_POINTS = {
  lessonComplete: 20,
  academyQuizAttempt: 10,
  academyQuizPassBonus: 40,
  teacherQuizOpened: 5,
  projectSaved: 10,
  projectComplete: 50,
  courseComplete: 100,
} as const;

export type LeaderboardActivityType =
  | "lesson_complete"
  | "academy_quiz_attempt"
  | "academy_quiz_pass"
  | "teacher_quiz_opened"
  | "project_saved"
  | "project_complete"
  | "course_complete";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
  quizzes: number;
  lessons: number;
  projects: number;
  courses: number;
};

type LeaderboardRow = {
  userId: string;
  displayName: string;
  points: number;
  quizzes: number;
  lessons: number;
  projects: number;
  courses: number;
};

export function getMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getMonthlyLeaderboardLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getNextMonthlyRefresh(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export function maskLearnerName(value?: string | null) {
  const clean = value?.trim().replace(/\s+/g, " ") || "Academy Learner";
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 24);
  return `${parts[0].slice(0, 20)} ${parts.at(-1)!.charAt(0).toUpperCase()}.`;
}

export async function recordLeaderboardActivity(input: {
  userId: string;
  displayName?: string | null;
  activityType: LeaderboardActivityType;
  activityKey: string;
  points: number;
  earnedAt?: string;
}) {
  if (!input.userId || !input.activityKey || input.points <= 0) return false;

  try {
    const database = await getD1Database();
    const earnedAt = input.earnedAt || new Date().toISOString();
    const result = await database
      .prepare(
        `insert or ignore into leaderboard_events
          (id, user_id, display_name, activity_type, activity_key, points, month_key, earned_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        randomUUID(),
        input.userId,
        maskLearnerName(input.displayName),
        input.activityType,
        input.activityKey,
        Math.round(input.points),
        getMonthKey(new Date(earnedAt)),
        earnedAt,
      )
      .run();

    return Boolean(result.meta?.changes);
  } catch {
    // Learning actions remain usable locally before the Sites D1 binding exists.
    return false;
  }
}

export async function getMonthlyLeaderboard(limit = 25): Promise<LeaderboardEntry[]> {
  try {
    const database = await getD1Database();
    const safeLimit = Math.min(100, Math.max(1, Math.round(limit)));
    const { results = [] } = await database
      .prepare(
        `select
           user_id as userId,
           max(display_name) as displayName,
           sum(points) as points,
           sum(case when activity_type like '%quiz%' then 1 else 0 end) as quizzes,
           sum(case when activity_type = 'lesson_complete' then 1 else 0 end) as lessons,
           sum(case when activity_type like 'project_%' then 1 else 0 end) as projects,
           sum(case when activity_type = 'course_complete' then 1 else 0 end) as courses
         from leaderboard_events
         where month_key = ?
         group by user_id
         order by points desc, max(earned_at) asc
         limit ?`,
      )
      .bind(getMonthKey(), safeLimit)
      .all<LeaderboardRow>();

    return results.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      displayName: row.displayName,
      points: Number(row.points) || 0,
      quizzes: Number(row.quizzes) || 0,
      lessons: Number(row.lessons) || 0,
      projects: Number(row.projects) || 0,
      courses: Number(row.courses) || 0,
    }));
  } catch {
    return [];
  }
}
