import type { AppRole } from '@/lib/auth/roles';

export interface UserBadge {
  id?: string;
  badgeId: string;
  name?: string;
  description?: string;
  awardedAt?: string;
  unlockedAt?: string;
}

export interface UserStreak {
  current: number;
  longest: number;
  lastActivityDate?: string;
}

export interface UserProgressItem {
  percentage?: number;
  lastViewedLesson?: string;
  completedLessons?: string[];
  updated_at?: string;
  completed_at?: string;
}

export interface UserCertificate {
  id: string;
  courseId?: string;
  courseName?: string;
  title?: string;
  completionDate?: string;
  userName?: string;
}

export interface DashboardUser {
  id?: string;
  name?: string;
  email?: string;
  role?: AppRole | string;
  classLevel?: string;
  enrolled_courses?: string[];
  enrolled_videos?: string[];
  purchased_ebooks?: string[];
  recently_viewed?: string[];
  provider?: string;
  badges?: UserBadge[];
  streak?: UserStreak | null;
  progress?: Record<string, UserProgressItem>;
  certificates?: UserCertificate[];
}
