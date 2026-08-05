import { LmsCourse, LmsEbook, LmsLesson, LmsProject } from "@/lib/lms/types";
import { lmsQuizzes } from "@/lib/lms/mock-data";

export function flattenLessons(course: LmsCourse): LmsLesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function hasIncompleteMarker(value: string): boolean {
  return /dummy|placeholder|coming\s+soon|will\s+be\s+added|to\s+be\s+added|untitled|example\.com|fallback-placeholder/i.test(
    value
  );
}

export function isSubstantialText(value?: string, minimumLength = 1): boolean {
  if (!value || value.trim().length < minimumLength) return false;
  return !hasIncompleteMarker(value);
}

export function isSafeAsset(value?: string): boolean {
  if (!value || value === "#") return false;
  if (hasIncompleteMarker(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");

  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isSafePdf(value?: string): boolean {
  if (!isSafeAsset(value)) return false;
  return value!.toLowerCase().split(/[?#]/)[0].endsWith(".pdf");
}

export function isCompleteCourse(course: LmsCourse): boolean {
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
          module.lessons.length >= 2
      ) &&
      lessons.length >= 5 &&
      lessons.every(
        (lesson) =>
          isSubstantialText(lesson.title, 6) &&
          isSubstantialText(lesson.slug, 4) &&
          isSubstantialText(lesson.duration, 3) &&
          isSubstantialText(lesson.content, 25)
      ) &&
      lessons.filter((lesson) => isSafeAsset(lesson.videoUrl)).length >= 2 &&
      lessons.some((lesson) => isSafeAsset(lesson.circuitDiagramUrl)) &&
      lessons.some((lesson) => isSubstantialText(lesson.code, 40)) &&
      lessons.some((lesson) => isSafePdf(lesson.pdfUrl)) &&
      lessons.some((lesson) => lesson.type === "quiz") &&
      course.downloadablePdfs.length >= 1 &&
      course.downloadablePdfs.every(
        (pdf) => isSubstantialText(pdf.title, 6) && isSafePdf(pdf.url)
      ) &&
      course.whatYouWillLearn.length >= 4 &&
      course.requiredComponents.length >= 1 &&
      course.projects.length >= 1 &&
      course.faqs.length >= 1 &&
      quiz &&
      quiz.questions.length >= 5
  );
}

export function isCompleteProject(project: LmsProject): boolean {
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

export function isCompleteEbook(ebook: LmsEbook): boolean {
  return Boolean(
    isSubstantialText(ebook.title, 8) &&
      isSubstantialText(ebook.description, 60) &&
      ebook.pages >= 4 &&
      isSafeAsset(ebook.coverUrl) &&
      isSafePdf(ebook.fileUrl)
  );
}
