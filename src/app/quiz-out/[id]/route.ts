import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import { isTeacherRole } from "@/lib/auth/roles";
import {
  getMonthKey,
  LEADERBOARD_POINTS,
  recordLeaderboardActivity,
} from "@/lib/lms/leaderboard";
import { isSafeExternalQuizUrl } from "@/lib/lms/quiz-links";
import { supabasePublic } from "@/lib/supabasePublic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const fallback = new URL("/quizzes", request.url);

  try {
    const { data, error } = await supabasePublic
      .from("webinars")
      .select("id,title,meeting_url")
      .eq("id", id)
      .is("schedule_date", null)
      .eq("is_live", false)
      .maybeSingle();

    if (error || !data || !isSafeExternalQuizUrl(data.meeting_url)) {
      fallback.searchParams.set("notice", "quiz-link-unavailable");
      return NextResponse.redirect(fallback);
    }

    const user = await getCurrentUser();
    if (user && !isTeacherRole(user.role)) {
      await recordLeaderboardActivity({
        userId: user.id,
        displayName: user.name,
        activityType: "teacher_quiz_opened",
        activityKey: `teacher-quiz:${data.id}:${getMonthKey()}`,
        points: LEADERBOARD_POINTS.teacherQuizOpened,
      });
    }

    return NextResponse.redirect(data.meeting_url);
  } catch {
    fallback.searchParams.set("notice", "quiz-link-unavailable");
    return NextResponse.redirect(fallback);
  }
}
