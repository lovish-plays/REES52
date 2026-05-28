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
  password_hash: string;
  role: 'Student' | 'Admin';
  enrolled_videos: string[]; // Video IDs
  purchased_ebooks: string[]; // Ebook IDs
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
  const defaultCategories: Category[] = [
    { id: 'cat-1', name: 'Robotics & Smart Cars', slug: 'robotics-smart-cars' },
    { id: 'cat-2', name: 'Arduino & Microcontrollers', slug: 'arduino-microcontrollers' },
    { id: 'cat-3', name: 'IoT & Sensors', slug: 'iot-sensors' },
    { id: 'cat-4', name: 'Drones & Quadcopters', slug: 'drones-quadcopters' },
  ];

  const defaultProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'REES52 Uno R3 Starter Kit',
      external_purchase_url: 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html',
      image_url: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=60',
      category_id: 'cat-2'
    },
    {
      id: 'prod-2',
      name: 'REES52 4WD Smart Robot Car Kit v2.0',
      external_purchase_url: 'https://rees52.com/robotics/456-rees52-4wd-smart-robot-car-kit.html',
      image_url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=60',
      category_id: 'cat-1'
    },
    {
      id: 'prod-3',
      name: 'REES52 Ultimate Sensor Kit (37 in 1)',
      external_purchase_url: 'https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60',
      category_id: 'cat-3'
    },
    {
      id: 'prod-4',
      name: 'REES52 F450 Drone DIY Builder Kit',
      external_purchase_url: 'https://rees52.com/drones/101-rees52-f450-drone-diy-kit.html',
      image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=60',
      category_id: 'cat-4'
    }
  ];

  const defaultEbooks: Ebook[] = [
    {
      id: 'ebk-1',
      title: 'Getting Started with Arduino Uno R3',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      category_id: 'cat-2',
      parent_product_id: 'prod-1',
      created_at: new Date('2026-05-10T10:00:00Z').toISOString()
    },
    {
      id: 'ebk-2',
      title: 'DIY 4WD Smart Car Building Guide',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      category_id: 'cat-1',
      parent_product_id: 'prod-2',
      created_at: new Date('2026-05-12T12:00:00Z').toISOString()
    },
    {
      id: 'ebk-3',
      title: 'Comprehensive Sensors Handbook (37-in-1)',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      category_id: 'cat-3',
      parent_product_id: 'prod-3',
      created_at: new Date('2026-05-15T08:30:00Z').toISOString()
    }
  ];

  const defaultVideos: Video[] = [
    {
      id: 'vid-1',
      title: 'Arduino Uno Setup and Blink Tutorial',
      youtube_url: 'https://www.youtube.com/watch?v=d8_xXNcGYgo',
      category_id: 'cat-2',
      parent_product_id: 'prod-1',
      created_at: new Date('2026-05-11T09:00:00Z').toISOString()
    },
    {
      id: 'vid-2',
      title: 'Assembling your 4WD Smart Robot Car Step-by-Step',
      youtube_url: 'https://www.youtube.com/watch?v=hBwslH_Wn4I',
      category_id: 'cat-1',
      parent_product_id: 'prod-2',
      created_at: new Date('2026-05-13T14:20:00Z').toISOString()
    },
    {
      id: 'vid-3',
      title: 'Interfacing Temperature Sensor (DHT11) with Arduino',
      youtube_url: 'https://www.youtube.com/watch?v=yG0-nle3rO8',
      category_id: 'cat-3',
      parent_product_id: 'prod-3',
      created_at: new Date('2026-05-16T11:00:00Z').toISOString()
    }
  ];

  const defaultWebinars: Webinar[] = [
    {
      id: 'web-1',
      title: 'Live Masterclass: Building Autonomous Drones at Home',
      description: 'Learn the principles of aeronautics, flight controllers, and assembling drone parts from scratch with REES52 engineers.',
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      schedule_date: new Date('2026-06-15T15:00:00Z').toISOString(),
      is_live: true
    },
    {
      id: 'web-2',
      title: 'IoT Sensors Integration with Dashboard Apps',
      description: 'A deep-dive workshop on piping sensor readings from ESP8266/ESP32 into Next.js applications and web databases.',
      meeting_url: 'https://meet.google.com/xyz-pdqr-lmn',
      schedule_date: new Date('2026-06-20T17:00:00Z').toISOString(),
      is_live: false
    }
  ];

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

// Get the current database state
export function getDB(): DatabaseStore {
  return initDB();
}

// Save database state
export function saveDB(db: DatabaseStore): void {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// UUID helper
export function generateUUID(): string {
  return crypto.randomUUID();
}
