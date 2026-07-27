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
  if (!hasSupabaseEnv) return getLocalCourses();

  try {
    const { data, error } = await supabasePublic
      .from("courses")
      .select("id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) return lmsCourses;
    return await hydrateCourses(data as CourseRow[]);
  } catch {
    return lmsCourses;
  }
}

export async function getCourseBySlug(slug: string): Promise<LmsCourse | null> {
  const mock = getLocalCourses().find((course) => course.slug === slug);
  if (!hasSupabaseEnv) return mock ?? null;

  try {
    const { data, error } = await supabasePublic
      .from("courses")
      .select("id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return mock ?? null;
    const [course] = await hydrateCourses([data as CourseRow]);
    return course ?? mock ?? null;
  } catch {
    return mock ?? null;
  }
}

export async function getProjects(): Promise<LmsProject[]> {
  if (!hasSupabaseEnv) return getLocalProjects();

  try {
    const { data, error } = await supabasePublic
      .from("projects")
      .select("id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) return getLocalProjects();
    return await hydrateProjects(data as ProjectRow[]);
  } catch {
    return getLocalProjects();
  }
}

export async function getProjectBySlug(slug: string): Promise<LmsProject | null> {
  const mock = getLocalProjects().find((project) => project.slug === slug);
  if (!hasSupabaseEnv) return mock ?? null;

  try {
    const { data, error } = await supabasePublic
      .from("projects")
      .select("id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return mock ?? null;
    const [project] = await hydrateProjects([data as ProjectRow]);
    return project ?? mock ?? null;
  } catch {
    return mock ?? null;
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
    return data.map((row: EbookRow) => mapEbookRow(row));
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
    progressPercentage: 45,
    lastLesson: "Ultrasonic Sensor",
    myCourses: lmsCourses.slice(0, 3),
    myEbooks: lmsEbooks.slice(0, 3),
    savedProjects: lmsProjects.slice(0, 3),
    recommendedCourses: lmsCourses.slice(3, 7),
    quizResults: [
      { title: "Arduino Basics Quiz", score: 8, total: 10, passed: true },
      { title: "Output Devices Quiz", score: 6, total: 10, passed: true },
      { title: "Sensors Quiz", score: 5, total: 10, passed: false }
    ]
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

    const quizResults = quizAttemptRows?.length
      ? (quizAttemptRows as QuizAttemptRow[]).map((row) => ({
          title: getQuizTitle(row.quizzes),
          score: row.score || 0,
          total: row.total_questions || 0,
          passed: Boolean(row.passed),
        }))
      : fallback.quizResults;

    return {
      ...fallback,
      continueCourse,
      progressPercentage,
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
    users: 128
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
  const pdfsByCourse = groupRows(courseIds, pdfRows, (row) => row.course_id, (row) => row.title || row.file_url);
  const faqsByCourse = groupRows(courseIds, faqRows, (row) => row.course_id, (row) => ({
    question: row.question || "Question",
    answer: row.answer || "Answer will be added by the admin team.",
  }));

  return rows.map((row) => {
    const mock = lmsCourses.find((course) => course.slug === row.slug);
    const modules = row.id ? modulesByCourse.get(row.id) ?? [] : [];
    const fallbackModules = modules.length ? modules : mock?.modules ?? [];
    const courseComponents = row.id ? componentsByCourse.get(row.id) ?? [] : [];
    const requiredComponents = courseComponents.filter((component) => component.role !== "related").map(({ role, ...component }) => component);
    const relatedProducts = courseComponents.filter((component) => component.role === "related").map(({ role, ...component }) => component);

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
      .select("id,module_id,course_id,title,slug,lesson_type,video_url,content,code,pdf_url,position,is_preview")
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
  return courses.sort((a, b) => courseIds.indexOf(a.id ?? "") - courseIds.indexOf(b.id ?? ""));
}

async function getProjectsByIds(projectIds: string[]): Promise<LmsProject[]> {
  const { data, error } = await supabasePublic
    .from("projects")
    .select("id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting")
    .in("id", projectIds)
    .eq("is_published", true);

  if (error || !data?.length) return lmsProjects.slice(0, Math.max(1, projectIds.length));
  const projects = await hydrateProjects(data as ProjectRow[]);
  return projects.sort((a, b) => projectIds.indexOf(a.id ?? "") - projectIds.indexOf(b.id ?? ""));
}

function mapCourseRow(row: CourseRow, fallback: Partial<LmsCourse> = {}): LmsCourse {
  const modules = fallback.modules ?? [];
  const lessonsCount = modules.reduce((total, module) => total + module.lessons.length, 0);

  return {
    id: row.id,
    title: row.title || "Untitled Course",
    slug: row.slug || slugify(row.title || "untitled-course"),
    shortDescription: row.short_description || "Project-based REES52 Academy course.",
    description: row.description || row.short_description || "A backend-ready LMS course.",
    category: row.category || "Robotics",
    classLevel: normalizeSchoolClass(row.class_level || fallback.classLevel),
    level: normalizeLevel(row.level),
    duration: row.duration || "Self-paced",
    lessonsCount: lessonsCount || fallback.lessonsCount || 0,
    language: fallback.language || "English",
    pricing: row.is_free === false ? "Paid" : "Free",
    price: toNumber(row.price),
    thumbnailUrl: row.thumbnail_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70",
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
    title: row.title || "Untitled Module",
    description: row.description || "Module description will be added by the admin team.",
    lessons,
  };
}

function mapLessonRow(row: LessonRow): LmsLesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    courseId: row.course_id,
    title: row.title || "Untitled Lesson",
    slug: row.slug || slugify(row.title || "untitled-lesson"),
    type: normalizeLessonType(row.lesson_type),
    duration: "Self-paced",
    videoUrl: row.video_url,
    content: row.content || "Lesson content will be added by the admin team.",
    code: row.code,
    pdfUrl: row.pdf_url,
    isPreview: row.is_preview,
  };
}

function mapProjectRow(row: ProjectRow, fallback: Partial<LmsProject> = {}): LmsProject {
  return {
    id: row.id,
    title: row.title || "Untitled Project",
    slug: row.slug || slugify(row.title || "untitled-project"),
    shortDescription: row.short_description || "Hands-on REES52 project.",
    description: row.description || row.short_description || "A backend-ready LMS project.",
    category: row.category || "Arduino Projects",
    classLevel: normalizeSchoolClass(row.class_level || fallback.classLevel),
    level: normalizeLevel(row.level),
    estimatedTime: row.estimated_time || "Self-paced",
    thumbnailUrl: row.thumbnail_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70",
    videoUrl: row.video_url,
    circuitDiagramUrl: row.circuit_diagram_url,
    sourceCode: row.source_code || "// Source code will be added by admin.",
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

function mapEbookRow(row: EbookRow): LmsEbook {
  return {
    id: row.id,
    title: row.title || "Untitled Ebook",
    slug: row.slug || slugify(row.title || "untitled-ebook"),
    description: row.description || "Downloadable REES52 Academy study material.",
    category: row.category || "Arduino Guides",
    pages: 0,
    level: normalizeLevel(row.level),
    coverUrl: row.cover_url || "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=700&auto=format&fit=crop&q=70",
    fileUrl: row.file_url || "#",
    isFree: row.is_free !== false
  };
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
