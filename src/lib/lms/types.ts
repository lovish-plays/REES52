import type { SchoolClass } from "@/lib/lms/class-categories";

export type LmsLevel = "Beginner" | "Intermediate" | "Advanced";
export type PricingType = "Free" | "Paid";

export interface LmsLesson {
  id?: string;
  moduleId?: string;
  courseId?: string;
  title: string;
  slug: string;
  type: "video" | "text" | "quiz" | "project";
  duration: string;
  videoUrl?: string;
  content: string;
  circuitDiagramUrl?: string;
  code?: string;
  pdfUrl?: string;
  isPreview?: boolean;
}

export interface LmsModule {
  id?: string;
  courseId?: string;
  title: string;
  description: string;
  lessons: LmsLesson[];
}

export interface LmsComponent {
  id?: string;
  name: string;
  quantity: number;
  productUrl: string;
  price?: number;
}

export interface LmsCourse {
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  classLevel: SchoolClass;
  level: LmsLevel;
  duration: string;
  lessonsCount: number;
  language: string;
  pricing: PricingType;
  price?: number;
  thumbnailUrl: string;
  whatYouWillLearn: string[];
  modules: LmsModule[];
  requiredComponents: LmsComponent[];
  projects: string[];
  downloadablePdfs: string[];
  relatedProducts: LmsComponent[];
  faqs: Array<{ question: string; answer: string }>;
}

export interface LmsProject {
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  classLevel: SchoolClass;
  level: LmsLevel;
  estimatedTime: string;
  thumbnailUrl: string;
  videoUrl?: string;
  circuitDiagramUrl?: string;
  sourceCode: string;
  steps: string[];
  troubleshooting: string[];
  components: LmsComponent[];
}

export interface LmsEbook {
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  pages: number;
  level: LmsLevel;
  coverUrl: string;
  fileUrl: string;
  isFree: boolean;
}

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctOption: string;
  explanation: string;
}

export interface LmsQuiz {
  title: string;
  courseSlug: string;
  moduleTitle: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export type PublicQuiz = Omit<LmsQuiz, "questions"> & {
  questions: Array<Pick<QuizQuestion, "question" | "options">>;
};

export interface LessonNavigation {
  previous?: LmsLesson;
  next?: LmsLesson;
  currentIndex: number;
  totalLessons: number;
}
