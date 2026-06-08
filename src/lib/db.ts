import crypto from 'crypto';

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
  updated_at: string;
  completed_at?: string;
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
  role: 'Student' | 'Admin';
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
  rating: number;
  review: string;
  created_at: string;
}

export interface DatabaseStore {
  categories: Category[];
  products: Product[];
  ebooks: Ebook[];
  videos: Video[];
  webinars: Webinar[];
  users: User[];
  reviews?: Review[];
}

// In-Memory database store for transient caching and type support
let memoryDb: DatabaseStore = {
  categories: [],
  products: [],
  ebooks: [],
  videos: [],
  webinars: [],
  users: [
    {
      id: 'usr-admin',
      name: 'REES52 Admin',
      email: 'admin@rees52.com',
      password_hash: '$2a$10$w5p3f2/Qy2r9yD5Hq6uMteP8C3uE/Z.6hH5f2d7zE3y1y3x4w.123',
      role: 'Admin',
      enrolled_videos: [],
      purchased_ebooks: []
    }
  ],
  reviews: []
};

// Deprecated local database file retriever
export function getDB(): DatabaseStore {
  return memoryDb;
}

// Deprecated local database file saver
export function saveDB(db: DatabaseStore): void {
  memoryDb = db;
}

// UUID helper
export function generateUUID(): string {
  return crypto.randomUUID();
}
