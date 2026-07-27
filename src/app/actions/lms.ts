'use server';

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/auth";
import { getCourseBySlug, getCourseLesson, getQuizzes, flattenLessons } from "@/lib/lms/data";
import { generateUUID, getDB, saveDB, type QuizAttempt } from "@/lib/db";
import type { LmsQuiz } from "@/lib/lms/types";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";
import { createClient } from "@/lib/supabaseServer";

export async function markLessonCompleteAction(courseSlug: string, lessonSlug: string) {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return { error: "Course not found." };

  const lesson = getCourseLesson(course, lessonSlug);
  if (!lesson) return { error: "Lesson not found." };

  const totalLessons = flattenLessons(course).length || 1;

  if (hasSupabaseEnv) return markLessonCompleteInSupabase(courseSlug, lessonSlug, totalLessons);

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in before marking lessons complete." };
  }

  const currentProgress = user.progress?.[course.id || course.slug];
  const completedLessons = new Set(currentProgress?.completedLessons || []);
  completedLessons.add(lessonSlug);
  const completedList = Array.from(completedLessons);
  const progressPercentage = Math.min(100, Math.round((completedList.length / totalLessons) * 100));
  const nextProgress = {
    percentage: progressPercentage,
    lastViewedLesson: lessonSlug,
    completedLessons: completedList,
    updated_at: new Date().toISOString(),
    completed_at: progressPercentage === 100 ? (currentProgress?.completed_at || new Date().toISOString()) : undefined,
  };
  const userProgress = { ...(user.progress || {}), [course.id || course.slug]: nextProgress };
  const updated = await (await import("@/lib/repositories/userRepository")).UserRepository.updateUser(user.id, {
    progress: userProgress,
  });
  if (!updated) return { error: "Unable to save lesson progress." };

  return {
    success: true,
    message: "Lesson marked complete.",
    progressPercentage,
  };
}

export async function getCourseEnrollmentStatus(courseSlug: string): Promise<{ authenticated: boolean; enrolled: boolean }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { authenticated: false, enrolled: false };
  if (currentUser.role === "Admin" || currentUser.role === "Teacher") return { authenticated: true, enrolled: true };

  if (hasSupabaseEnv) {
    try {
      const supabase = await createClient();
      const { data: course } = await supabase.from("courses").select("id").eq("slug", courseSlug).maybeSingle();
      if (!course?.id) return { authenticated: true, enrolled: false };
      const { data: enrollment } = await supabase
        .from("course_enrollments")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("course_id", course.id)
        .maybeSingle();
      return { authenticated: true, enrolled: Boolean(enrollment) };
    } catch {
      return { authenticated: true, enrolled: false };
    }
  }

  return {
    authenticated: true,
    enrolled: Boolean(currentUser.enrolled_courses?.includes(courseSlug)),
  };
}

export async function submitQuizAction(input: {
  courseSlug: string;
  quizTitle?: string;
  answers: string[];
}): Promise<{ success?: boolean; error?: string; score?: number; totalQuestions?: number; passed?: boolean; attemptedAt?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Please sign in before submitting a quiz." };

  let quiz: LmsQuiz | null = getQuizzes().find((item) => item.courseSlug === input.courseSlug) ?? null;
  let quizId: string | undefined;
  let questions = quiz?.questions ?? [];
  let passingScore = quiz?.passingScore ?? 60;

  if (hasSupabaseEnv) {
    try {
      const supabase = await createClient();
      const { data: course } = await supabase.from("courses").select("id").eq("slug", input.courseSlug).maybeSingle();
      if (course?.id) {
        const { data: quizRow } = await supabase
          .from("quizzes")
          .select("id,title,passing_score")
          .eq("course_id", course.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (quizRow?.id) {
          quizId = quizRow.id;
          passingScore = Number(quizRow.passing_score) || passingScore;
          const { data: questionRows } = await supabase
            .from("quiz_questions")
            .select("question,option_a,option_b,option_c,option_d,correct_option,explanation")
            .eq("quiz_id", quizRow.id)
            .order("position", { ascending: true });
          if (questionRows?.length) {
            questions = questionRows.map((row: {
              question: string;
              option_a: string | null;
              option_b: string | null;
              option_c: string | null;
              option_d: string | null;
              correct_option: string | null;
              explanation: string | null;
            }) => ({
              question: row.question,
              options: [row.option_a || "", row.option_b || "", row.option_c || "", row.option_d || ""] as [string, string, string, string],
              correctOption: row.correct_option || "",
              explanation: row.explanation || "",
            }));
          }
        }
      }
    } catch {
      // Fall back to local course quiz data if the remote quiz is not ready yet.
    }
  }

  if (!questions.length) return { error: "This lesson does not have a quiz yet." };
  const score = questions.reduce((total, question, index) => total + (input.answers[index] === question.correctOption ? 1 : 0), 0);
  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= passingScore;
  const attemptedAt = new Date().toISOString();

  if (hasSupabaseEnv && quizId) {
    const supabase = await createClient();
    const { error } = await supabase.from("quiz_attempts").insert({
      quiz_id: quizId,
      user_id: currentUser.id,
      score,
      total_questions: totalQuestions,
      passed,
      attempted_at: attemptedAt,
    });
    if (error) return { error: error.message };
  } else {
    const db = getDB();
    const attempt: QuizAttempt = {
      id: generateUUID(),
      userId: currentUser.id,
      courseSlug: input.courseSlug,
      quizTitle: input.quizTitle || quiz?.title || "Quiz",
      score,
      totalQuestions,
      passed,
      attemptedAt,
    };
    db.quiz_attempts = [...(db.quiz_attempts || []), attempt].slice(-1000);
    saveDB(db);
  }

  revalidatePath("/dashboard/quiz-results");
  revalidatePath("/dashboard");
  return { success: true, score, totalQuestions, passed, attemptedAt };
}

async function markLessonCompleteInSupabase(courseSlug: string, lessonSlug: string, fallbackTotalLessons: number) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Please sign in before marking lessons complete." };
  }

  const { data: courseRow, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (courseError || !courseRow?.id) {
    return { error: "Course is not available in Supabase yet." };
  }

  const { data: lessonRow, error: lessonError } = await supabase
    .from("lessons")
    .select("id,course_id")
    .eq("course_id", courseRow.id)
    .eq("slug", lessonSlug)
    .maybeSingle();

  if (lessonError || !lessonRow?.id) {
    return { error: "Lesson is not available in Supabase yet." };
  }

  const profileName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        full_name: profileName,
        role: "student",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );

  if (profileError) {
    return { error: profileError.message };
  }

  const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseRow.id)
    .maybeSingle();

  if (existingEnrollmentError) {
    return { error: existingEnrollmentError.message };
  }

  if (!existingEnrollment) {
    const { error: enrollmentError } = await supabase
      .from("course_enrollments")
      .insert({
        user_id: user.id,
        course_id: courseRow.id,
        progress_percentage: 0,
      });

    if (enrollmentError) {
      return { error: enrollmentError.message };
    }
  }

  const completedAt = new Date().toISOString();
  const { error: progressError } = await supabase
    .from("student_progress")
    .upsert(
      {
        user_id: user.id,
        course_id: courseRow.id,
        lesson_id: lessonRow.id,
        is_completed: true,
        completed_at: completedAt,
      },
      { onConflict: "user_id,lesson_id" },
    );

  if (progressError) {
    return { error: progressError.message };
  }

  const { count: totalLessons, error: totalLessonsError } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseRow.id)
    .eq("is_published", true);

  if (totalLessonsError) {
    return { error: totalLessonsError.message };
  }

  const { count: completedLessons, error: completedLessonsError } = await supabase
    .from("student_progress")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseRow.id)
    .eq("user_id", user.id)
    .eq("is_completed", true);

  if (completedLessonsError) {
    return { error: completedLessonsError.message };
  }

  const lessonTotal = totalLessons || fallbackTotalLessons || 1;
  const progressPercentage = Math.min(100, Math.round(((completedLessons || 1) / lessonTotal) * 100));

  const { error: updateEnrollmentError } = await supabase
    .from("course_enrollments")
    .update({
      progress_percentage: progressPercentage,
      completed_at: progressPercentage >= 100 ? completedAt : null,
    })
    .eq("user_id", user.id)
    .eq("course_id", courseRow.id);

  if (updateEnrollmentError) {
    return { error: updateEnrollmentError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/learn/${courseSlug}/${lessonSlug}`);

  return {
    success: true,
    message: "Lesson marked complete.",
    progressPercentage,
  };
}
