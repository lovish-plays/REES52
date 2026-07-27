import { supabasePublic } from "@/lib/supabasePublic";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";
import { getCurrentUser } from "@/app/actions/auth";
import { getDB } from "@/lib/db";
import { lmsCourses, lmsEbooks, lmsProjects, lmsQuizzes } from "@/lib/lms/mock-data";
import { getLocalCourses, getLocalProjects } from "@/lib/lms/local-content-store";
import { normalizeSchoolClass } from "@/lib/lms/class-categories";
import {
  LessonNavigation,
  LmsComponent,
  LmsCourse,
  LmsEbook,
  LmsLesson,
  LmsLevel,
  LmsModule,
  LmsProject,
  LmsQuiz,
  PublicQuiz,
} from "@/lib/lms/types";

type CourseRow = {
  id?: string;
  title?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  category?: string;
  class_level?: string;
  level?: string;
  duration?: string;
  thumbnail_url?: string;
  is_free?: boolean;
  price?: number | string;
};

type ModuleRow = {
  id?: string;
  course_id?: string;
  title?: string;
  description?: string;
  position?: number;
};

type LessonRow = {
  id?: string;
  module_id?: string;
  course_id?: string;
  title?: string;
  slug?: string;
  lesson_type?: string;
  video_url?: string;
  content?: string;
  code?: string;
  pdf_url?: string;
  duration?: string;
  position?: number;
  is_preview?: boolean;
};

type CourseOutcomeRow = {
  course_id?: string;
  outcome?: string;
  position?: number;
};

type CourseComponentRow = {
  id?: string;
  course_id?: string;
  component_name?: string;
  quantity?: number;
  product_url?: string;
  price?: number | string;
  component_role?: "required" | "related";
  position?: number;
};

type CourseProjectRow = {
  course_id?: string;
  project_title?: string;
  position?: number;
};

type CoursePdfRow = {
  course_id?: string;
  title?: string;
  file_url?: string;
  position?: number;
};

type CourseFaqRow = {
  course_id?: string;
  question?: string;
  answer?: string;
  position?: number;
};

type ProjectRow = {
  id?: string;
  title?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  category?: string;
  class_level?: string;
  level?: string;
  estimated_time?: string;
  thumbnail_url?: string;
  video_url?: string;
  circuit_diagram_url?: string;
  source_code?: string;
  steps?: string;
  troubleshooting?: string;
};

type ProjectComponentRow = {
  id?: string;
  project_id?: string;
  component_name?: string;
  quantity?: number;
  product_url?: string;
  price?: number | string;
};

type EbookRow = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  level?: string;
  cover_url?: string;
  file_url?: string;
  is_free?: boolean;
};

type QuizAttemptRow = {
  score?: number;
  total_questions?: number;
  passed?: boolean;
  quizzes?: { title?: string } | Array<{ title?: string }>;
};

type DashboardSnapshot = {
  continueCourse: LmsCourse;
  progressPercentage: number;
  lastLesson: string;
  myCourses: LmsCourse[];
  myEbooks: LmsEbook[];
  savedProjects: LmsProject[];
  recommendedCourses: LmsCourse[];
  quizResults: Array<{ title: string; score: number; total: number; passed: boolean }>;
};

export async function getCourses(): Promise<LmsCourse[]> {
  if (!hasSupabaseEnv) return resolvePublicCourses(getLocalCourses());

  try {
    const { data, error } = await supabasePublic
      .from("courses")
      .select("id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) return lmsCourses;
    return resolvePublicCourses(await hydrateCourses(data as CourseRow[]));
  } catch {
    return lmsCourses;
  }
}

export async function getCourseBySlug(slug: string): Promise<LmsCourse | null> {
  const launchCourse = lmsCourses.find((course) => course.slug === slug);
  const local = getLocalCourses().find((course) => course.slug === slug);
  if (!hasSupabaseEnv) return resolveCourseCandidate(local, launchCourse);

  try {
    const { data, error } = await supabasePublic
      .from("courses")
      .select("id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) return resolveCourseCandidate(local, launchCourse);
    const [course] = await hydrateCourses([data as CourseRow]);
    return resolveCourseCandidate(course, launchCourse);
  } catch {
    return resolveCourseCandidate(local, launchCourse);
  }
}

export async function getProjects(): Promise<LmsProject[]> {
  if (!hasSupabaseEnv) return resolvePublicProjects(getLocalProjects());

  try {
    const { data, error } = await supabasePublic
      .from("projects")
      .select("id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) return lmsProjects;
    return resolvePublicProjects(await hydrateProjects(data as ProjectRow[]));
  } catch {
    return lmsProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<LmsProject | null> {
  const launchProject = lmsProjects.find((project) => project.slug === slug);
  const local = getLocalProjects().find((project) => project.slug === slug);
  if (!hasSupabaseEnv) return resolveProjectCandidate(local, launchProject);

  try {
    const { data, error } = await supabasePublic
      .from("projects")
      .select("id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) return resolveProjectCandidate(local, launchProject);
    const [project] = await hydrateProjects([data as ProjectRow]);
    return resolveProjectCandidate(project, launchProject);
  } catch {
    return resolveProjectCandidate(local, launchProject);
  }
}

export async function getEbooks(): Promise<LmsEbook[]> {
  if (!hasSupabaseEnv) return lmsEbooks;

  try {
    const { data, error } = await supabasePublic
      .from("ebooks")
      .select("id,title,slug,description,category,level,cover_url,file_url,is_free")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) return lmsEbooks;
    return resolvePublicEbooks(data.map((row: EbookRow) => mapEbookRow(row)));
  } catch {
    return lmsEbooks;
  }
}

export function getQuizzes() {
  return lmsQuizzes;
}

export function toPublicQuiz(quiz: LmsQuiz): PublicQuiz {
  return {
    title: quiz.title,
    courseSlug: quiz.courseSlug,
    moduleTitle: quiz.moduleTitle,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map(({ question, options }) => ({ question, options })),
  };
}

export function getCourseLesson(course: LmsCourse, lessonSlug: string): LmsLesson | null {
  return flattenLessons(course).find((lesson) => lesson.slug === lessonSlug) ?? null;
}

export function flattenLessons(course: LmsCourse): LmsLesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function getLessonNavigation(course: LmsCourse, lessonSlug: string): LessonNavigation {
  const lessons = flattenLessons(course);
  const currentIndex = Math.max(0, lessons.findIndex((lesson) => lesson.slug === lessonSlug));
  return {
    previous: currentIndex > 0 ? lessons[currentIndex - 1] : undefined,
    next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : undefined,
    currentIndex,
    totalLessons: lessons.length
  };
}

export function getFeaturedCourses(courses: LmsCourse[], count = 4) {
  return courses.slice(0, count);
}

export function getDashboardSnapshot(): DashboardSnapshot {
  return {
    continueCourse: lmsCourses[0],
    progressPercentage: 0,
    lastLesson: "Not started",
    myCourses: [],
    myEbooks: [],
    savedProjects: [],
    recommendedCourses: lmsCourses,
    quizResults: []
  };
}

export async function getDashboardSnapshotForCurrentUser(): Promise<DashboardSnapshot> {
  const fallback = getDashboardSnapshot();
  const currentUser = await getCurrentUser();
  if (!currentUser) return fallback;

  if (!hasSupabaseEnv) {
    const allCourses = getLocalCourses(true);
    const enrolledSlugs = new Set(currentUser.enrolled_courses || []);
    const progressEntries = Object.entries(currentUser.progress || {});
    const progressByCourse = new Map(progressEntries);
    const myCourses = allCourses.filter((course) => enrolledSlugs.has(course.slug) || progressByCourse.has(course.id || course.slug));
    const continueCourse = myCourses[0] ?? fallback.continueCourse;
    const continueProgress = progressByCourse.get(continueCourse.id || continueCourse.slug)?.percentage ?? 0;
    const localEbooks = lmsEbooks.filter((ebook) => (currentUser.purchased_ebooks || []).includes(ebook.id || ebook.slug));
    const savedProjects = currentUser.recently_viewed?.length
      ? lmsProjects.filter((project) => currentUser.recently_viewed?.includes(project.id || project.slug))
      : fallback.savedProjects;
    const attempts = (getDB().quiz_attempts || [])
      .filter((attempt) => attempt.userId === currentUser.id)
      .slice(-6)
      .reverse()
      .map((attempt) => ({
        title: attempt.quizTitle,
        score: attempt.score,
        total: attempt.totalQuestions,
        passed: attempt.passed,
      }));

    return {
      ...fallback,
      continueCourse,
      progressPercentage: continueProgress,
      lastLesson: progressByCourse.get(continueCourse.id || continueCourse.slug)?.lastViewedLesson || "Course introduction",
      myCourses: myCourses.length ? myCourses : fallback.myCourses,
      myEbooks: localEbooks.length ? localEbooks : [],
      savedProjects: savedProjects.length ? savedProjects : [],
      quizResults: attempts.length ? attempts : [],
    };
  }

  try {
    const { createClient } = await import("@/lib/supabaseServer");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return fallback;

    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id,progress_percentage")
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false });

    const courseIds = (enrollments ?? [])
      .map((enrollment: { course_id?: string }) => enrollment.course_id)
      .filter(Boolean) as string[];

    const myCourses = courseIds.length ? await getCoursesByIds(courseIds) : fallback.myCourses;
    const continueCourse = myCourses[0] ?? fallback.continueCourse;
    const progressEntries: Array<[string, number]> = (enrollments ?? []).flatMap(
      (enrollment: { course_id?: string; progress_percentage?: number | string }) => {
        if (!enrollment.course_id) return [];
        const parsedProgress =
          typeof enrollment.progress_percentage === "number"
            ? enrollment.progress_percentage
            : Number(enrollment.progress_percentage ?? 0);

        return [[enrollment.course_id, Number.isFinite(parsedProgress) ? parsedProgress : 0]];
      },
    );
    const progressByCourse = new Map<string, number>(progressEntries);
    const progressPercentage: number =
      (continueCourse.id ? progressByCourse.get(continueCourse.id) : undefined) ?? fallback.progressPercentage;

    const { data: savedProjectRows } = await supabase
      .from("saved_projects")
      .select("project_id")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })
      .limit(6);

    const savedProjectIds = (savedProjectRows ?? [])
      .map((row: { project_id?: string }) => row.project_id)
      .filter(Boolean) as string[];
    const savedProjects = savedProjectIds.length ? await getProjectsByIds(savedProjectIds) : fallback.savedProjects;

    const { data: quizAttemptRows } = await supabase
      .from("quiz_attempts")
      .select("score,total_questions,passed,quizzes(title)")
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false })
      .limit(3);

    const metadataQuizResults = Array.isArray(user.user_metadata?.academy_quiz_results)
      ? user.user_metadata.academy_quiz_results
          .filter(
            (row: unknown): row is {
              title: string;
              score: number;
              total: number;
              passed: boolean;
            } =>
              typeof row === "object" &&
              row !== null &&
              typeof (row as { title?: unknown }).title === "string" &&
              typeof (row as { score?: unknown }).score === "number" &&
              typeof (row as { total?: unknown }).total === "number",
          )
          .slice(0, 3)
      : [];
    const quizResults = quizAttemptRows?.length
      ? (quizAttemptRows as QuizAttemptRow[]).map((row) => ({
          title: getQuizTitle(row.quizzes),
          score: row.score || 0,
          total: row.total_questions || 0,
          passed: Boolean(row.passed),
        }))
      : metadataQuizResults;
    const lastLessonSlug =
      user.user_metadata?.academy_last_lesson &&
      typeof user.user_metadata.academy_last_lesson === "object"
        ? (user.user_metadata.academy_last_lesson as Record<string, unknown>)[continueCourse.slug]
        : undefined;
    const lastLesson =
      typeof lastLessonSlug === "string"
        ? getCourseLesson(continueCourse, lastLessonSlug)?.title || fallback.lastLesson
        : fallback.lastLesson;

    return {
      ...fallback,
      continueCourse,
      progressPercentage,
      lastLesson,
      myCourses,
      savedProjects,
      quizResults,
    };
  } catch {
    return fallback;
  }
}

export function getAdminSnapshot() {
  return {
    courses: lmsCourses.length,
    modules: lmsCourses.reduce((total, course) => total + course.modules.length, 0),
    lessons: lmsCourses.reduce((total, course) => total + flattenLessons(course).length, 0),
    projects: lmsProjects.length,
    ebooks: lmsEbooks.length,
    quizzes: lmsQuizzes.length,
    users: getDB().users.length
  };
}

async function hydrateCourses(rows: CourseRow[]): Promise<LmsCourse[]> {
  const courseIds = rows.map((row) => row.id).filter(Boolean) as string[];
  const [
    moduleRows,
    lessonRows,
    outcomeRows,
    componentRows,
    projectRows,
    pdfRows,
    faqRows,
  ] = await Promise.all([
    fetchCourseModules(courseIds),
    fetchCourseLessons(courseIds),
    fetchCourseOutcomes(courseIds),
    fetchCourseComponents(courseIds),
    fetchCourseProjects(courseIds),
    fetchCoursePdfs(courseIds),
    fetchCourseFaqs(courseIds),
  ]);

  const lessonsByModule = new Map<string, LmsLesson[]>();
  lessonRows.forEach((row) => {
    const moduleId = row.module_id;
    if (!moduleId) return;
    const current = lessonsByModule.get(moduleId) ?? [];
    current.push(mapLessonRow(row));
    lessonsByModule.set(moduleId, current);
  });

  const modulesByCourse = new Map<string, LmsModule[]>();
  moduleRows.forEach((row) => {
    const courseId = row.course_id;
    if (!courseId) return;
    const current = modulesByCourse.get(courseId) ?? [];
    current.push(mapModuleRow(row, lessonsByModule.get(row.id ?? "") ?? []));
    modulesByCourse.set(courseId, current);
  });

  const outcomesByCourse = groupRows(courseIds, outcomeRows, (row) => row.course_id, (row) => row.outcome);
  const componentsByCourse = groupRows(courseIds, componentRows, (row) => row.course_id, mapCourseComponentRow);
  const projectsByCourse = groupRows(courseIds, projectRows, (row) => row.course_id, (row) => row.project_title);
  const pdfsByCourse = groupRows(
    courseIds,
    pdfRows,
    (row) => row.course_id,
    (row) => {
      if (!row.file_url) return undefined;
      return { title: row.title || "Course workbook", url: row.file_url };
    },
  );
  const faqsByCourse = groupRows(courseIds, faqRows, (row) => row.course_id, (row) => ({
    question: row.question || "",
    answer: row.answer || "",
  }));

  return rows.map((row) => {
    const mock = lmsCourses.find((course) => course.slug === row.slug);
    const modules = row.id ? modulesByCourse.get(row.id) ?? [] : [];
    const fallbackModules = modules.length ? modules : mock?.modules ?? [];
    const courseComponents = row.id ? componentsByCourse.get(row.id) ?? [] : [];
    const requiredComponents = courseComponents
      .filter((component) => component.role !== "related")
      .map(toComponentWithoutRole);
    const relatedProducts = courseComponents
      .filter((component) => component.role === "related")
      .map(toComponentWithoutRole);

    return mapCourseRow(row, {
      modules: fallbackModules,
      whatYouWillLearn: row.id && outcomesByCourse.get(row.id)?.length ? outcomesByCourse.get(row.id) : mock?.whatYouWillLearn ?? ["Complete practical lessons", "Build a guided project"],
      requiredComponents: requiredComponents.length ? requiredComponents : mock?.requiredComponents ?? [],
      projects: row.id && projectsByCourse.get(row.id)?.length ? projectsByCourse.get(row.id) : mock?.projects ?? [],
      downloadablePdfs: row.id && pdfsByCourse.get(row.id)?.length ? pdfsByCourse.get(row.id) : mock?.downloadablePdfs ?? [],
      relatedProducts: relatedProducts.length ? relatedProducts : mock?.relatedProducts ?? [],
      faqs: row.id && faqsByCourse.get(row.id)?.length ? faqsByCourse.get(row.id) : mock?.faqs ?? [],
    });
  });
}

async function hydrateProjects(rows: ProjectRow[]): Promise<LmsProject[]> {
  const projectIds = rows.map((row) => row.id).filter(Boolean) as string[];
  const componentRows = await fetchProjectComponents(projectIds);

  const componentsByProject = new Map<string, LmsComponent[]>();
  componentRows.forEach((row) => {
    const projectId = row.project_id;
    if (!projectId) return;
    const current = componentsByProject.get(projectId) ?? [];
    current.push(mapProjectComponentRow(row));
    componentsByProject.set(projectId, current);
  });

  return rows.map((row) => {
    const mock = lmsProjects.find((project) => project.slug === row.slug);
    const components = row.id ? componentsByProject.get(row.id) ?? [] : [];
    return mapProjectRow(row, {
      components: components.length ? components : mock?.components ?? [],
    });
  });
}

async function fetchCourseModules(courseIds: string[]): Promise<ModuleRow[]> {
  if (!courseIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("course_modules")
      .select("id,course_id,title,description,position")
      .in("course_id", courseIds)
      .eq("is_published", true)
      .order("position", { ascending: true });

    if (error || !data) return [];
    return data as ModuleRow[];
  } catch {
    return [];
  }
}

async function fetchCourseLessons(courseIds: string[]): Promise<LessonRow[]> {
  if (!courseIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("lessons")
      .select("id,module_id,course_id,title,slug,lesson_type,video_url,content,code,pdf_url,duration,position,is_preview")
      .in("course_id", courseIds)
      .eq("is_published", true)
      .order("position", { ascending: true });

    if (error || !data) return [];
    return data as LessonRow[];
  } catch {
    return [];
  }
}

async function fetchCourseOutcomes(courseIds: string[]): Promise<CourseOutcomeRow[]> {
  if (!courseIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("course_outcomes")
      .select("course_id,outcome,position")
      .in("course_id", courseIds)
      .order("position", { ascending: true });

    if (error || !data) return [];
    return data as CourseOutcomeRow[];
  } catch {
    return [];
  }
}

async function fetchCourseComponents(courseIds: string[]): Promise<CourseComponentRow[]> {
  if (!courseIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("course_components")
      .select("id,course_id,component_name,quantity,product_url,price,component_role,position")
      .in("course_id", courseIds)
      .order("position", { ascending: true });

    if (error || !data) return [];
    return data as CourseComponentRow[];
  } catch {
    return [];
  }
}

async function fetchCourseProjects(courseIds: string[]): Promise<CourseProjectRow[]> {
  if (!courseIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("course_projects")
      .select("course_id,project_title,position")
      .in("course_id", courseIds)
      .order("position", { ascending: true });

    if (error || !data) return [];
    return data as CourseProjectRow[];
  } catch {
    return [];
  }
}

async function fetchCoursePdfs(courseIds: string[]): Promise<CoursePdfRow[]> {
  if (!courseIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("course_pdfs")
      .select("course_id,title,file_url,position")
      .in("course_id", courseIds)
      .order("position", { ascending: true });

    if (error || !data) return [];
    return data as CoursePdfRow[];
  } catch {
    return [];
  }
}

async function fetchCourseFaqs(courseIds: string[]): Promise<CourseFaqRow[]> {
  if (!courseIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("course_faqs")
      .select("course_id,question,answer,position")
      .in("course_id", courseIds)
      .order("position", { ascending: true });

    if (error || !data) return [];
    return data as CourseFaqRow[];
  } catch {
    return [];
  }
}

async function fetchProjectComponents(projectIds: string[]): Promise<ProjectComponentRow[]> {
  if (!projectIds.length) return [];

  try {
    const { data, error } = await supabasePublic
      .from("project_components")
      .select("id,project_id,component_name,quantity,product_url,price")
      .in("project_id", projectIds)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as ProjectComponentRow[];
  } catch {
    return [];
  }
}

async function getCoursesByIds(courseIds: string[]): Promise<LmsCourse[]> {
  const { data, error } = await supabasePublic
    .from("courses")
    .select("id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price")
    .in("id", courseIds)
    .eq("is_published", true);

  if (error || !data?.length) return lmsCourses.slice(0, Math.max(1, courseIds.length));
  const courses = await hydrateCourses(data as CourseRow[]);
  return courses
    .map((course) => resolveCourseCandidate(course, lmsCourses.find((item) => item.slug === course.slug)))
    .filter((course): course is LmsCourse => Boolean(course))
    .sort((a, b) => courseIds.indexOf(a.id ?? "") - courseIds.indexOf(b.id ?? ""));
}

async function getProjectsByIds(projectIds: string[]): Promise<LmsProject[]> {
  const { data, error } = await supabasePublic
    .from("projects")
    .select("id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting")
    .in("id", projectIds)
    .eq("is_published", true);

  if (error || !data?.length) return lmsProjects.slice(0, Math.max(1, projectIds.length));
  const projects = await hydrateProjects(data as ProjectRow[]);
  return projects
    .map((project) => resolveProjectCandidate(project, lmsProjects.find((item) => item.slug === project.slug)))
    .filter((project): project is LmsProject => Boolean(project))
    .sort((a, b) => projectIds.indexOf(a.id ?? "") - projectIds.indexOf(b.id ?? ""));
}

function mapCourseRow(row: CourseRow, fallback: Partial<LmsCourse> = {}): LmsCourse {
  const modules = fallback.modules ?? [];
  const lessonsCount = modules.reduce((total, module) => total + module.lessons.length, 0);

  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || slugify(row.title || ""),
    shortDescription: row.short_description || "",
    description: row.description || row.short_description || "",
    category: row.category || "",
    classLevel: normalizeSchoolClass(row.class_level || fallback.classLevel),
    level: normalizeLevel(row.level),
    duration: row.duration || "",
    lessonsCount: lessonsCount || fallback.lessonsCount || 0,
    language: fallback.language || "English",
    pricing: row.is_free === false ? "Paid" : "Free",
    price: toNumber(row.price),
    thumbnailUrl: row.thumbnail_url || "",
    whatYouWillLearn: fallback.whatYouWillLearn ?? [],
    modules,
    requiredComponents: fallback.requiredComponents ?? [],
    projects: fallback.projects ?? [],
    downloadablePdfs: fallback.downloadablePdfs ?? [],
    relatedProducts: fallback.relatedProducts ?? [],
    faqs: fallback.faqs ?? []
  };
}

function mapModuleRow(row: ModuleRow, lessons: LmsLesson[]): LmsModule {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title || "",
    description: row.description || "",
    lessons,
  };
}

function mapLessonRow(row: LessonRow): LmsLesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    courseId: row.course_id,
    title: row.title || "",
    slug: row.slug || slugify(row.title || ""),
    type: normalizeLessonType(row.lesson_type),
    duration: row.duration || "",
    videoUrl: row.video_url,
    content: row.content || "",
    code: row.code,
    pdfUrl: row.pdf_url,
    isPreview: row.is_preview,
  };
}

function mapProjectRow(row: ProjectRow, fallback: Partial<LmsProject> = {}): LmsProject {
  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || slugify(row.title || ""),
    shortDescription: row.short_description || "",
    description: row.description || row.short_description || "",
    category: row.category || "",
    classLevel: normalizeSchoolClass(row.class_level || fallback.classLevel),
    level: normalizeLevel(row.level),
    estimatedTime: row.estimated_time || "",
    thumbnailUrl: row.thumbnail_url || "",
    videoUrl: row.video_url,
    circuitDiagramUrl: row.circuit_diagram_url,
    sourceCode: row.source_code || "",
    steps: splitText(row.steps),
    troubleshooting: splitText(row.troubleshooting),
    components: fallback.components ?? [],
  };
}

function mapProjectComponentRow(row: ProjectComponentRow): LmsComponent {
  return {
    id: row.id,
    name: row.component_name || "Component",
    quantity: row.quantity || 1,
    productUrl: row.product_url || "https://rees52.com",
    price: toNumber(row.price),
  };
}

function mapCourseComponentRow(row: CourseComponentRow): LmsComponent & { role?: "required" | "related" } {
  return {
    id: row.id,
    name: row.component_name || "Component",
    quantity: row.quantity || 1,
    productUrl: row.product_url || "https://rees52.com",
    price: toNumber(row.price),
    role: row.component_role,
  };
}

function toComponentWithoutRole(component: LmsComponent & { role?: "required" | "related" }): LmsComponent {
  return {
    id: component.id,
    name: component.name,
    quantity: component.quantity,
    productUrl: component.productUrl,
    price: component.price,
  };
}

function mapEbookRow(row: EbookRow): LmsEbook {
  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || slugify(row.title || ""),
    description: row.description || "",
    category: row.category || "",
    pages: 0,
    level: normalizeLevel(row.level),
    coverUrl: row.cover_url || "",
    fileUrl: row.file_url || "",
    isFree: row.is_free !== false
  };
}

function resolvePublicCourses(candidates: LmsCourse[]): LmsCourse[] {
  const candidateBySlug = new Map(candidates.map((course) => [course.slug, course]));
  const launchSlugs = new Set(lmsCourses.map((course) => course.slug));
  const launchCourses = lmsCourses.map((launchCourse) =>
    resolveCourseCandidate(candidateBySlug.get(launchCourse.slug), launchCourse),
  );
  const additionalCourses = candidates.filter(
    (course) => !launchSlugs.has(course.slug) && isCompleteCourse(course),
  );

  return [...launchCourses, ...additionalCourses].filter(
    (course): course is LmsCourse => Boolean(course),
  );
}

function resolveCourseCandidate(
  candidate?: LmsCourse,
  launchCourse?: LmsCourse,
): LmsCourse | null {
  if (candidate && isCompleteCourse(candidate)) return candidate;
  if (launchCourse && isCompleteCourse(launchCourse)) return launchCourse;
  return null;
}

function resolvePublicProjects(candidates: LmsProject[]): LmsProject[] {
  const candidateBySlug = new Map(candidates.map((project) => [project.slug, project]));
  const launchSlugs = new Set(lmsProjects.map((project) => project.slug));
  const launchProjects = lmsProjects.map((launchProject) =>
    resolveProjectCandidate(candidateBySlug.get(launchProject.slug), launchProject),
  );
  const additionalProjects = candidates.filter(
    (project) => !launchSlugs.has(project.slug) && isCompleteProject(project),
  );

  return [...launchProjects, ...additionalProjects].filter(
    (project): project is LmsProject => Boolean(project),
  );
}

function resolveProjectCandidate(
  candidate?: LmsProject,
  launchProject?: LmsProject,
): LmsProject | null {
  if (candidate && isCompleteProject(candidate)) return candidate;
  if (launchProject && isCompleteProject(launchProject)) return launchProject;
  return null;
}

function resolvePublicEbooks(candidates: LmsEbook[]): LmsEbook[] {
  const candidateBySlug = new Map(candidates.map((ebook) => [ebook.slug, ebook]));
  const launchSlugs = new Set(lmsEbooks.map((ebook) => ebook.slug));
  const launchEbooks = lmsEbooks.map((launchEbook) => {
    const candidate = candidateBySlug.get(launchEbook.slug);
    return candidate && isCompleteEbook(candidate) ? candidate : launchEbook;
  });
  const additionalEbooks = candidates.filter(
    (ebook) => !launchSlugs.has(ebook.slug) && isCompleteEbook(ebook),
  );

  return [...launchEbooks, ...additionalEbooks];
}

function isCompleteCourse(course: LmsCourse) {
  const lessons = flattenLessons(course);
  const quiz = lmsQuizzes.find((item) => item.courseSlug === course.slug);

  return Boolean(
    isSubstantialText(course.title, 8) &&
      isSubstantialText(course.shortDescription, 30) &&
      isSubstantialText(course.description, 80) &&
      isSafeAsset(course.thumbnailUrl) &&
      course.modules.length >= 2 &&
      course.modules.every(
        (module) =>
          isSubstantialText(module.title, 8) &&
          isSubstantialText(module.description, 20) &&
          module.lessons.length >= 2,
      ) &&
      lessons.length >= 5 &&
      lessons.every(
        (lesson) =>
          isSubstantialText(lesson.title, 6) &&
          isSubstantialText(lesson.slug, 4) &&
          isSubstantialText(lesson.duration, 3) &&
          isSubstantialText(lesson.content, 25),
      ) &&
      lessons.filter((lesson) => isSafeAsset(lesson.videoUrl)).length >= 2 &&
      lessons.some((lesson) => isSafeAsset(lesson.circuitDiagramUrl)) &&
      lessons.some((lesson) => isSubstantialText(lesson.code, 40)) &&
      lessons.some((lesson) => isSafePdf(lesson.pdfUrl)) &&
      lessons.some((lesson) => lesson.type === "quiz") &&
      course.downloadablePdfs.length >= 1 &&
      course.downloadablePdfs.every(
        (pdf) => isSubstantialText(pdf.title, 6) && isSafePdf(pdf.url),
      ) &&
      course.whatYouWillLearn.length >= 4 &&
      course.requiredComponents.length >= 1 &&
      course.projects.length >= 1 &&
      course.faqs.length >= 1 &&
      quiz &&
      quiz.questions.length >= 5
  );
}

function isCompleteProject(project: LmsProject) {
  return Boolean(
    isSubstantialText(project.title, 8) &&
      isSubstantialText(project.shortDescription, 30) &&
      isSubstantialText(project.description, 80) &&
      isSafeAsset(project.thumbnailUrl) &&
      isSafeAsset(project.videoUrl) &&
      isSafeAsset(project.circuitDiagramUrl) &&
      isSubstantialText(project.sourceCode, 80) &&
      project.steps.length >= 4 &&
      project.steps.every((step) => isSubstantialText(step, 20)) &&
      project.troubleshooting.length >= 3 &&
      project.components.length >= 1
  );
}

function isCompleteEbook(ebook: LmsEbook) {
  return Boolean(
    isSubstantialText(ebook.title, 8) &&
      isSubstantialText(ebook.description, 60) &&
      ebook.pages >= 4 &&
      isSafeAsset(ebook.coverUrl) &&
      isSafePdf(ebook.fileUrl)
  );
}

function isSubstantialText(value?: string, minimumLength = 1) {
  if (!value || value.trim().length < minimumLength) return false;
  return !hasIncompleteMarker(value);
}

function isSafeAsset(value?: string) {
  if (!value || value === "#") return false;
  return !hasIncompleteMarker(value);
}

function isSafePdf(value?: string) {
  if (!isSafeAsset(value)) return false;
  return value!.toLowerCase().split(/[?#]/)[0].endsWith(".pdf");
}

function hasIncompleteMarker(value: string) {
  return /dummy|placeholder|coming\s+soon|will\s+be\s+added|to\s+be\s+added|untitled|example\.com|fallback-placeholder/i.test(
    value,
  );
}

function groupRows<Row, Value>(
  keys: string[],
  rows: Row[],
  getKey: (row: Row) => string | undefined,
  mapRow: (row: Row) => Value | undefined,
) {
  const grouped = new Map<string, NonNullable<Value>[]>();
  keys.forEach((key) => grouped.set(key, []));

  rows.forEach((row) => {
    const key = getKey(row);
    if (!key) return;

    const value = mapRow(row);
    if (value === undefined || value === null) return;

    const current = grouped.get(key) ?? [];
    current.push(value as NonNullable<Value>);
    grouped.set(key, current);
  });

  return grouped;
}

function normalizeLevel(value?: string): LmsLevel {
  if (value === "Beginner" || value === "Intermediate" || value === "Advanced") {
    return value;
  }

  return "Beginner";
}

function normalizeLessonType(value?: string): LmsLesson["type"] {
  if (value === "text" || value === "quiz" || value === "project") {
    return value;
  }

  return "video";
}

function toNumber(value?: number | string) {
  if (typeof value === "number") return value;
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getQuizTitle(value?: QuizAttemptRow["quizzes"]) {
  if (Array.isArray(value)) return value[0]?.title || "Quiz Attempt";
  return value?.title || "Quiz Attempt";
}

function splitText(value?: string) {
  if (!value) return [];
  return value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
