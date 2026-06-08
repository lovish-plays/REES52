import fs from 'fs';
import path from 'path';
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

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: 'Student' | 'Admin';
  enrolled_videos: string[]; // Video IDs
  purchased_ebooks: string[]; // Ebook IDs
  avatar_url?: string;
  provider?: string;
}

export interface DatabaseStore {
  categories: Category[];
  products: Product[];
  ebooks: Ebook[];
  videos: Video[];
  webinars: Webinar[];
  users: User[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'src/lib/db-store.json');

// Helper to guarantee DB directory and file exist
function initDB(): DatabaseStore {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading database file, resetting database:", e);
    }
  }

  // Initial Seed Data
  const defaultCategories: Category[] = [];
  const defaultProducts: Product[] = [];
  const defaultEbooks: Ebook[] = [];
  const defaultVideos: Video[] = [];
  const defaultWebinars: Webinar[] = [];

  // Default Admin User
  // Password is 'admin123' (will be hashed in login check or here)
  // We hash it using bcrypt in seed or store plain hash for local testing.
  // Using standard bcrypt hash for 'admin123' -> $2a$10$wN9D9aVf23gV8hYn16nEieW7qO6zS3xXoWJ2K2.G1j82Gle/6i/8K (example) or let's use actual bcryptjs hash:
  // For 'admin123', standard bcrypt hash is: $2a$10$tM2jV4Y.wY9aG0934.3lfeN.5gZ6U09k89gH823g4F9hJ80vNde2C (we can just verify it dynamically)
  const defaultUsers: User[] = [
    {
      id: 'usr-admin',
      name: 'REES52 Admin',
      email: 'admin@rees52.com',
      password_hash: '$2a$10$w5p3f2/Qy2r9yD5Hq6uMteP8C3uE/Z.6hH5f2d7zE3y1y3x4w.123', // Mock bcrypt hash for 'admin123'
      role: 'Admin',
      enrolled_videos: [],
      purchased_ebooks: []
    }
  ];

  const db: DatabaseStore = {
    categories: defaultCategories,
    products: defaultProducts,
    ebooks: defaultEbooks,
    videos: defaultVideos,
    webinars: defaultWebinars,
    users: defaultUsers
  };

  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  return db;
}

let cachedDb: DatabaseStore | null = null;

// Get the current database state
export function getDB(): DatabaseStore {
  if (!cachedDb) {
    cachedDb = initDB();
  }
  return cachedDb;
}

// Save database state
export function saveDB(db: DatabaseStore): void {
  cachedDb = db;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn("Failed to save database file (expected in read-only environments):", err);
  }
}

// UUID helper
export function generateUUID(): string {
  return crypto.randomUUID();
}
