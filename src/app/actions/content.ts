'use server';

import { createClient } from '@/lib/supabaseServer';
import { toUUID, fromUUID } from '@/lib/uuidHelper';
import { getDB } from '@/lib/db';

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ContentProduct {
  id: string;
  name: string;
  external_purchase_url: string;
  image_url: string;
  category_id: string;
}

export interface ContentEbook {
  id: string;
  title: string;
  pdf_url: string;
  category_id: string;
  parent_product_id: string;
  created_at: string;
}

export interface ContentVideo {
  id: string;
  title: string;
  youtube_url: string;
  category_id: string;
  parent_product_id: string;
  created_at: string;
}

export interface ContentWebinar {
  id: string;
  title: string;
  description: string;
  meeting_url: string;
  schedule_date: string;
  is_live: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Single shared client factory used by all reads in this file */
async function db() {
  return createClient();
}

/** Wraps a promise with a timeout */
async function withTimeout(promise: any, timeoutMs = 5000): Promise<any> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database query timed out")), timeoutMs)
    )
  ]);
}

// ── Public read actions ───────────────────────────────────────────────────────

export async function getCategories(): Promise<ContentCategory[]> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('categories')
        .select('id,name,slug')
        .order('name', { ascending: true })
    );
    if (error) throw error;
    return (data ?? []).map((c: any) => ({
      id: fromUUID(c.id),
      name: c.name,
      slug: c.slug,
    }));
  } catch (e) {
    console.error('getCategories:', e);
    try {
      const localDb = getDB();
      return (localDb.categories ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }));
    } catch {
      return [];
    }
  }
}

export async function getProducts(): Promise<ContentProduct[]> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('id,name,external_url,image_url,category_id')
        .order('name', { ascending: true })
    );
    if (error) throw error;
    return (data ?? []).map((p: any) => ({
      id: fromUUID(p.id),
      name: p.name,
      external_purchase_url: p.external_url,
      image_url: p.image_url,
      category_id: fromUUID(p.category_id),
    }));
  } catch (e) {
    console.error('getProducts:', e);
    try {
      const localDb = getDB();
      return (localDb.products ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        external_purchase_url: p.external_purchase_url,
        image_url: p.image_url,
        category_id: p.category_id,
      }));
    } catch {
      return [];
    }
  }
}

export async function getEbooks(): Promise<ContentEbook[]> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('ebooks')
        .select('id,title,pdf_url,category_id,product_id,created_at')
        .order('created_at', { ascending: false })
    );
    if (error) throw error;
    return (data ?? []).map((e: any) => ({
      id: fromUUID(e.id),
      title: e.title,
      pdf_url: e.pdf_url,
      category_id: fromUUID(e.category_id),
      parent_product_id: fromUUID(e.product_id),
      created_at: e.created_at,
    }));
  } catch (e) {
    console.error('getEbooks:', e);
    try {
      const localDb = getDB();
      return (localDb.ebooks ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        pdf_url: e.pdf_url,
        category_id: e.category_id,
        parent_product_id: e.parent_product_id,
        created_at: e.created_at,
      }));
    } catch {
      return [];
    }
  }
}

export async function getVideos(): Promise<ContentVideo[]> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('videos')
        .select('id,title,youtube_url,category_id,product_id,created_at')
        .order('created_at', { ascending: false })
    );
    if (error) throw error;
    return (data ?? []).map((v: any) => ({
      id: fromUUID(v.id),
      title: v.title,
      youtube_url: v.youtube_url,
      category_id: fromUUID(v.category_id),
      parent_product_id: fromUUID(v.product_id),
      created_at: v.created_at,
    }));
  } catch (e) {
    console.error('getVideos:', e);
    try {
      const localDb = getDB();
      return (localDb.videos ?? []).map((v: any) => ({
        id: v.id,
        title: v.title,
        youtube_url: v.youtube_url,
        category_id: v.category_id,
        parent_product_id: v.parent_product_id,
        created_at: v.created_at,
      }));
    } catch {
      return [];
    }
  }
}

export async function getWebinars(): Promise<ContentWebinar[]> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('webinars')
        .select('id,title,description,meeting_url,schedule_date,is_live')
        .order('schedule_date', { ascending: false })
    );
    if (error) throw error;
    return (data ?? []).map((w: any) => ({
      id: fromUUID(w.id),
      title: w.title,
      description: w.description,
      meeting_url: w.meeting_url,
      schedule_date: w.schedule_date,
      is_live: w.is_live,
    }));
  } catch (e) {
    console.error('getWebinars:', e);
    try {
      const localDb = getDB();
      return (localDb.webinars ?? []).map((w: any) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        meeting_url: w.meeting_url,
        schedule_date: w.schedule_date,
        is_live: w.is_live,
      }));
    } catch {
      return [];
    }
  }
}

// ── Single-item fetches ───────────────────────────────────────────────────────

export async function getCategoryById(id: string): Promise<ContentCategory | null> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('categories')
        .select('id,name,slug')
        .eq('id', toUUID(id))
        .maybeSingle()
    );
    if (error || !data) return null;
    return {
      id: fromUUID(data.id),
      name: data.name,
      slug: data.slug,
    };
  } catch {
    try {
      const localDb = getDB();
      const c = localDb.categories.find((item: any) => item.id === id);
      if (c) {
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
        };
      }
    } catch {}
    return null;
  }
}

export async function getProductById(id: string): Promise<ContentProduct | null> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('id,name,external_url,image_url,category_id')
        .eq('id', toUUID(id))
        .maybeSingle()
    );
    if (error || !data) return null;
    return {
      id: fromUUID(data.id),
      name: data.name,
      external_purchase_url: data.external_url,
      image_url: data.image_url,
      category_id: fromUUID(data.category_id),
    };
  } catch {
    try {
      const localDb = getDB();
      const p = localDb.products.find((item: any) => item.id === id);
      if (p) {
        return {
          id: p.id,
          name: p.name,
          external_purchase_url: p.external_purchase_url,
          image_url: p.image_url,
          category_id: p.category_id,
        };
      }
    } catch {}
    return null;
  }
}

export async function getEbookById(id: string): Promise<ContentEbook | null> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('ebooks')
        .select('id,title,pdf_url,category_id,product_id,created_at')
        .eq('id', toUUID(id))
        .maybeSingle()
    );
    if (error || !data) return null;
    return {
      id: fromUUID(data.id),
      title: data.title,
      pdf_url: data.pdf_url,
      category_id: fromUUID(data.category_id),
      parent_product_id: fromUUID(data.product_id),
      created_at: data.created_at,
    };
  } catch {
    try {
      const localDb = getDB();
      const eb = localDb.ebooks.find((item: any) => item.id === id);
      if (eb) {
        return {
          id: eb.id,
          title: eb.title,
          pdf_url: eb.pdf_url,
          category_id: eb.category_id,
          parent_product_id: eb.parent_product_id,
          created_at: eb.created_at,
        };
      }
    } catch {}
    return null;
  }
}

export async function getVideoById(id: string): Promise<ContentVideo | null> {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('videos')
        .select('id,title,youtube_url,category_id,product_id,created_at')
        .eq('id', toUUID(id))
        .maybeSingle()
    );
    if (error || !data) return null;
    return {
      id: fromUUID(data.id),
      title: data.title,
      youtube_url: data.youtube_url,
      category_id: fromUUID(data.category_id),
      parent_product_id: fromUUID(data.product_id),
      created_at: data.created_at,
    };
  } catch {
    try {
      const localDb = getDB();
      const v = localDb.videos.find((item: any) => item.id === id);
      if (v) {
        return {
          id: v.id,
          title: v.title,
          youtube_url: v.youtube_url,
          category_id: v.category_id,
          parent_product_id: v.parent_product_id,
          created_at: v.created_at,
        };
      }
    } catch {}
    return null;
  }
}

// ── Unified feed (all five tables fetched in parallel) ────────────────────────

export async function getUnifiedFeed() {
  const [categories, products, ebooks, videos, webinars] = await Promise.all([
    getCategories(),
    getProducts(),
    getEbooks(),
    getVideos(),
    getWebinars(),
  ]);

  const feed = [
    ...ebooks.map((eb: any) => ({
      id: eb.id,
      title: eb.title,
      type: 'ebook' as const,
      categoryId: eb.category_id,
      productId: eb.parent_product_id,
      date: eb.created_at,
      url: `/ebooks/${eb.id}`,
      rawUrl: eb.pdf_url,
    })),
    ...videos.map((vi: any) => ({
      id: vi.id,
      title: vi.title,
      type: 'video' as const,
      categoryId: vi.category_id,
      productId: vi.parent_product_id,
      date: vi.created_at,
      url: `/videos/${vi.id}`,
      rawUrl: vi.youtube_url,
    })),
    ...webinars.map((wb: any) => ({
      id: wb.id,
      title: wb.title,
      type: 'webinar' as const,
      categoryId: '',
      productId: '',
      date: wb.schedule_date,
      url: wb.meeting_url,
      description: wb.description,
      isLive: wb.is_live,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { feed, categories, products };
}

export async function getNotifications() {
  try {
    const supabase = await db();
    const { data, error } = await withTimeout(
      supabase
        .from('notifications')
        .select('id,message,link,created_at')
        .order('created_at', { ascending: false })
    );
    if (error) throw error;
    return (data ?? []).map((n: any) => ({
      id: fromUUID(n.id),
      message: n.message,
      link: n.link,
      created_at: n.created_at,
    }));
  } catch (e) {
    console.error('getNotifications:', e);
    return [];
  }
}
