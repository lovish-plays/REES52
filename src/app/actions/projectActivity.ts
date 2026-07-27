"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/auth";
import { isTeacherRole } from "@/lib/auth/roles";
import { getProjectBySlug } from "@/lib/lms/data";
import {
  LEADERBOARD_POINTS,
  recordLeaderboardActivity,
} from "@/lib/lms/leaderboard";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";
import { createClient } from "@/lib/supabaseServer";

async function requireStudent() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in to record project activity.");
  if (isTeacherRole(user.role)) throw new Error("Leaderboard points are for student accounts.");
  return user;
}

export async function saveProjectActivityAction(projectSlug: string) {
  try {
    const user = await requireStudent();
    const project = await getProjectBySlug(projectSlug);
    if (!project) return { error: "Project not found." };

    let isNewSave = true;
    if (hasSupabaseEnv) {
      const supabase = await createClient();
      const { data: projectRow, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .eq("is_published", true)
        .maybeSingle();
      if (projectError || !projectRow?.id) return { error: "This project is not available to save yet." };

      const { data: existing, error: existingError } = await supabase
        .from("saved_projects")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", projectRow.id)
        .maybeSingle();
      if (existingError) return { error: existingError.message };
      isNewSave = !existing;

      if (!existing) {
        const { error } = await supabase.from("saved_projects").insert({
          user_id: user.id,
          project_id: projectRow.id,
          saved_at: new Date().toISOString(),
        });
        if (error) return { error: error.message };
      }
    }

    const awardedPoints = isNewSave
      ? await recordLeaderboardActivity({
          userId: user.id,
          displayName: user.name,
          activityType: "project_saved",
          activityKey: `project-save:${projectSlug}`,
          points: LEADERBOARD_POINTS.projectSaved,
        })
      : false;

    revalidateProjectActivity();
    return {
      success: true,
      awardedPoints: awardedPoints ? LEADERBOARD_POINTS.projectSaved : 0,
      message: isNewSave ? "Project saved to your dashboard." : "Project is already saved.",
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function completeProjectActivityAction(projectSlug: string) {
  try {
    const user = await requireStudent();
    const project = await getProjectBySlug(projectSlug);
    if (!project) return { error: "Project not found." };

    const awarded = await recordLeaderboardActivity({
      userId: user.id,
      displayName: user.name,
      activityType: "project_complete",
      activityKey: `project-complete:${projectSlug}`,
      points: LEADERBOARD_POINTS.projectComplete,
    });

    revalidateProjectActivity();
    return {
      success: true,
      awardedPoints: awarded ? LEADERBOARD_POINTS.projectComplete : 0,
      message: awarded
        ? "Project completed and points added."
        : "This project completion is already on your leaderboard record.",
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

function revalidateProjectActivity() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/saved-projects");
  revalidatePath("/leaderboard");
  revalidatePath("/");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to record project activity.";
}
