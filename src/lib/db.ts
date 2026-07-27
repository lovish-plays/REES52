import crypto from 'crypto';
import seedDb from './db-store.json';
import type { AppRole } from '@/lib/auth/roles';

// Define Interface Types matching our Supabase schema
export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  external_purchase_url: string;
  image_url: string;
  category_id: string;
}

export interface Ebook {
  id: string;
  title: string;
  pdf_url: string;
  category_id: string;
  parent_product_id: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  category_id: string;
  parent_product_id: string;
  created_at: string;
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  meeting_url: string;
  schedule_date: string;
  is_live: boolean;
}

export interface UserProgress {
  percentage: number;
  lastViewedLesson?: string;
  completedLessons?: string[];
  updated_at: string;
  completed_at?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  courseSlug: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  attemptedAt: string;
}

export interface UserCertificate {
  id: string;
  courseId: string;
  courseName: string;
  completionDate: string;
  userName: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  awardedAt: string;
  badgeId: string; // 'first-project', 'arduino-beginner', 'iot-explorer', 'robotics-builder'
}

export interface UserStreak {
  current: number;
  longest: number;
  lastActivityDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: AppRole;
  classLevel?: string;
  enrolled_courses: string[];
  enrolled_videos: string[]; // Video IDs
  purchased_ebooks: string[]; // Ebook IDs
  provider?: string;
  progress?: { [courseId: string]: UserProgress };
  certificates?: UserCertificate[];
  badges?: UserBadge[];
  streak?: UserStreak;
  recently_viewed?: string[]; // Course/Project IDs
}

export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  review: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  timestamp: string;
}

export interface DatabaseStore {
  categories: Category[];
  products: Product[];
  ebooks: Ebook[];
  videos: Video[];
  webinars: Webinar[];
  users: User[];
  quiz_attempts?: QuizAttempt[];
  reviews?: Review[];
  analytics_events?: AnalyticsEvent[];
}

type LocalDatabaseRuntime = typeof globalThis & {
  __rees52MemoryDb?: DatabaseStore;
};

const localDatabaseRuntime = globalThis as LocalDatabaseRuntime;

// Development-only fallback store. Keeping it on globalThis prevents separate
// server-action bundles from creating inconsistent copies during local testing.
localDatabaseRuntime.__rees52MemoryDb ??= structuredClone(seedDb as DatabaseStore);

// Deprecated local database file retriever
export function getDB(): DatabaseStore {
  return localDatabaseRuntime.__rees52MemoryDb!;
}

// Deprecated local database file saver
export function saveDB(db: DatabaseStore): void {
  localDatabaseRuntime.__rees52MemoryDb = db;
}

// UUID helper
export function generateUUID(): string {
  return crypto.randomUUID();
}
