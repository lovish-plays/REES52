'use server';

import { createClient } from '@/lib/supabaseServer';
import { toUUID, fromUUID } from '@/lib/uuidHelper';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Single shared client factory used by all reads in this file */
async function db() {
  return createClient();
}

// ── Public read actions ───────────────────────────────────────────────────────

export async function getCategories() {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('categories')
      .select('id,name,slug')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((c) => ({
      id: fromUUID(c.id),
      name: c.name,
      slug: c.slug,
    }));
  } catch (e) {
    console.error('getCategories:', e);
    return [];
  }
}

export async function getProducts() {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('products')
      .select('id,name,external_url,image_url,category_id')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((p) => ({
      id: fromUUID(p.id),
      name: p.name,
      external_purchase_url: p.external_url,
      image_url: p.image_url,
      category_id: fromUUID(p.category_id),
    }));
  } catch (e) {
    console.error('getProducts:', e);
    return [];
  }
}

export async function getEbooks() {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('ebooks')
      .select('id,title,pdf_url,category_id,product_id,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((e) => ({
      id: fromUUID(e.id),
      title: e.title,
      pdf_url: e.pdf_url,
      category_id: fromUUID(e.category_id),
      parent_product_id: fromUUID(e.product_id),
      created_at: e.created_at,
    }));
  } catch (e) {
    console.error('getEbooks:', e);
    return [];
  }
}

export async function getVideos() {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('videos')
      .select('id,title,youtube_url,category_id,product_id,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((v) => ({
      id: fromUUID(v.id),
      title: v.title,
      youtube_url: v.youtube_url,
      category_id: fromUUID(v.category_id),
      parent_product_id: fromUUID(v.product_id),
      created_at: v.created_at,
    }));
  } catch (e) {
    console.error('getVideos:', e);
    return [];
  }
}

export async function getWebinars() {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('webinars')
      .select('id,title,description,meeting_url,schedule_date,is_live')
      .order('schedule_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((w) => ({
      id: fromUUID(w.id),
      title: w.title,
      description: w.description,
      meeting_url: w.meeting_url,
      schedule_date: w.schedule_date,
      is_live: w.is_live,
    }));
  } catch (e) {
    console.error('getWebinars:', e);
    return [];
  }
}

// ── Single-item fetches ───────────────────────────────────────────────────────

export async function getCategoryById(id: string) {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('categories')
      .select('id,name,slug')
      .eq('id', toUUID(id))
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: fromUUID(data.id),
      name: data.name,
      slug: data.slug,
    };
  } catch {
    return null;
  }
}

export async function getProductById(id: string) {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('products')
      .select('id,name,external_url,image_url,category_id')
      .eq('id', toUUID(id))
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: fromUUID(data.id),
      name: data.name,
      external_purchase_url: data.external_url,
      image_url: data.image_url,
      category_id: fromUUID(data.category_id),
    };
  } catch {
    return null;
  }
}

export async function getEbookById(id: string) {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('ebooks')
      .select('id,title,pdf_url,category_id,product_id,created_at')
      .eq('id', toUUID(id))
      .maybeSingle();
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
    return null;
  }
}

export async function getVideoById(id: string) {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('videos')
      .select('id,title,youtube_url,category_id,product_id,created_at')
      .eq('id', toUUID(id))
      .maybeSingle();
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
    ...ebooks.map((eb) => ({
      id: eb.id,
      title: eb.title,
      type: 'ebook' as const,
      categoryId: eb.category_id,
      productId: eb.parent_product_id,
      date: eb.created_at,
      url: `/ebooks/${eb.id}`,
      rawUrl: eb.pdf_url,
    })),
    ...videos.map((vi) => ({
      id: vi.id,
      title: vi.title,
      type: 'video' as const,
      categoryId: vi.category_id,
      productId: vi.parent_product_id,
      date: vi.created_at,
      url: `/videos/${vi.id}`,
      rawUrl: vi.youtube_url,
    })),
    ...webinars.map((wb) => ({
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
    const { data, error } = await supabase
      .from('notifications')
      .select('id,message,link,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((n) => ({
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
