'use server';

import { getDB } from '@/lib/db';
import { supabaseServer } from '@/lib/supabaseServer';

const UUID_MAP: Record<string, string> = {
  "11111111-1111-1111-1111-111111111111": "cat-1",
  "11111111-1111-1111-1111-111111111112": "cat-2",
  "11111111-1111-1111-1111-111111111113": "cat-3",
  "11111111-1111-1111-1111-111111111114": "cat-4",
  
  "22222222-2222-2222-2222-222222222221": "prod-1",
  "22222222-2222-2222-2222-222222222222": "prod-2",
  "22222222-2222-2222-2222-222222222223": "prod-3",
  "22222222-2222-2222-2222-222222222224": "prod-4",
  
  "33333333-3333-3333-3333-333333333331": "ebk-1",
  "33333333-3333-3333-3333-333333333332": "ebk-2",
  "33333333-3333-3333-3333-333333333333": "ebk-3",
  
  "44444444-4444-4444-4444-444444444441": "vid-1",
  "44444444-4444-4444-4444-444444444442": "vid-2",
  "44444444-4444-4444-4444-444444444443": "vid-3",
  
  "55555555-5555-5555-5555-555555555551": "web-1",
  "55555555-5555-5555-5555-555555555552": "web-2",
};

const REVERSE_UUID_MAP: Record<string, string> = {
  "cat-1": "11111111-1111-1111-1111-111111111111",
  "cat-2": "11111111-1111-1111-1111-111111111112",
  "cat-3": "11111111-1111-1111-1111-111111111113",
  "cat-4": "11111111-1111-1111-1111-111111111114",
  
  "prod-1": "22222222-2222-2222-2222-222222222221",
  "prod-2": "22222222-2222-2222-2222-222222222222",
  "prod-3": "22222222-2222-2222-2222-222222222223",
  "prod-4": "22222222-2222-2222-2222-222222222224",
  
  "ebk-1": "33333333-3333-3333-3333-333333333331",
  "ebk-2": "33333333-3333-3333-3333-333333333332",
  "ebk-3": "33333333-3333-3333-3333-333333333333",
  
  "vid-1": "44444444-4444-4444-4444-444444444441",
  "vid-2": "44444444-4444-4444-4444-444444444442",
  "vid-3": "44444444-4444-4444-4444-444444444443",
  
  "web-1": "55555555-5555-5555-5555-555555555551",
  "web-2": "55555555-5555-5555-5555-555555555552",
};

function toShortId(id: string | null | undefined): string {
  if (!id) return "";
  return UUID_MAP[id] || id;
}

function toUUID(id: string | null | undefined): string {
  if (!id) return "";
  return REVERSE_UUID_MAP[id] || id;
}

export async function getCategories() {
  try {
    const { data, error } = await supabaseServer
      .from('categories')
      .select('id,name,slug')
      .order('name', { ascending: true });
    
    if (error || !data || data.length === 0) {
      console.warn("Supabase getCategories empty or failed, falling back to JSON:", error?.message);
      return getDB().categories;
    }
    return data.map(c => ({
      id: toShortId(c.id),
      name: c.name,
      slug: c.slug
    }));
  } catch (e) {
    console.error("getCategories error:", e);
    return getDB().categories;
  }
}

export async function getProducts() {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('id,name,external_url,image_url,category_id');
    
    if (error || !data || data.length === 0) {
      console.warn("Supabase getProducts empty or failed, falling back to JSON:", error?.message);
      return getDB().products;
    }
    return data.map(p => ({
      id: toShortId(p.id),
      name: p.name,
      external_purchase_url: p.external_url,
      image_url: p.image_url,
      category_id: toShortId(p.category_id)
    }));
  } catch (e) {
    console.error("getProducts error:", e);
    return getDB().products;
  }
}

export async function getEbooks() {
  try {
    const { data, error } = await supabaseServer
      .from('ebooks')
      .select('id,title,pdf_url,category_id,product_id,created_at')
      .order('created_at', { ascending: false });
    
    if (error || !data || data.length === 0) {
      console.warn("Supabase getEbooks empty or failed, falling back to JSON:", error?.message);
      return getDB().ebooks;
    }
    return data.map(e => ({
      id: toShortId(e.id),
      title: e.title,
      pdf_url: e.pdf_url,
      category_id: toShortId(e.category_id),
      parent_product_id: toShortId(e.product_id),
      created_at: e.created_at
    }));
  } catch (e) {
    console.error("getEbooks error:", e);
    return getDB().ebooks;
  }
}

export async function getVideos() {
  try {
    const { data, error } = await supabaseServer
      .from('videos')
      .select('id,title,youtube_url,category_id,product_id,created_at')
      .order('created_at', { ascending: false });
    
    if (error || !data || data.length === 0) {
      console.warn("Supabase getVideos empty or failed, falling back to JSON:", error?.message);
      return getDB().videos;
    }
    return data.map(v => ({
      id: toShortId(v.id),
      title: v.title,
      youtube_url: v.youtube_url,
      category_id: toShortId(v.category_id),
      parent_product_id: toShortId(v.product_id),
      created_at: v.created_at
    }));
  } catch (e) {
    console.error("getVideos error:", e);
    return getDB().videos;
  }
}

export async function getWebinars() {
  try {
    const { data, error } = await supabaseServer
      .from('webinars')
      .select('id,title,description,meeting_url,schedule_date,is_live')
      .order('schedule_date', { ascending: false });
    
    if (error || !data || data.length === 0) {
      console.warn("Supabase getWebinars empty or failed, falling back to JSON:", error?.message);
      return getDB().webinars;
    }
    return data.map(w => ({
      id: toShortId(w.id),
      title: w.title,
      description: w.description,
      meeting_url: w.meeting_url,
      schedule_date: w.schedule_date,
      is_live: w.is_live
    }));
  } catch (e) {
    console.error("getWebinars error:", e);
    return getDB().webinars;
  }
}

export async function getCategoryById(id: string) {
  try {
    const uuidId = toUUID(id);
    const { data, error } = await supabaseServer
      .from('categories')
      .select('id,name,slug')
      .eq('id', uuidId)
      .maybeSingle();
    
    if (error || !data) {
      return getDB().categories.find(c => c.id === id) || null;
    }
    return {
      id: toShortId(data.id),
      name: data.name,
      slug: data.slug
    };
  } catch (e) {
    return getDB().categories.find(c => c.id === id) || null;
  }
}

export async function getProductById(id: string) {
  try {
    const uuidId = toUUID(id);
    const { data, error } = await supabaseServer
      .from('products')
      .select('id,name,external_url,image_url,category_id')
      .eq('id', uuidId)
      .maybeSingle();
    
    if (error || !data) {
      return getDB().products.find(p => p.id === id) || null;
    }
    return {
      id: toShortId(data.id),
      name: data.name,
      external_purchase_url: data.external_url,
      image_url: data.image_url,
      category_id: toShortId(data.category_id)
    };
  } catch (e) {
    return getDB().products.find(p => p.id === id) || null;
  }
}

export async function getEbookById(id: string) {
  try {
    const uuidId = toUUID(id);
    const { data, error } = await supabaseServer
      .from('ebooks')
      .select('id,title,pdf_url,category_id,product_id,created_at')
      .eq('id', uuidId)
      .maybeSingle();
    
    if (error || !data) {
      return getDB().ebooks.find(e => e.id === id) || null;
    }
    return {
      id: toShortId(data.id),
      title: data.title,
      pdf_url: data.pdf_url,
      category_id: toShortId(data.category_id),
      parent_product_id: toShortId(data.product_id),
      created_at: data.created_at
    };
  } catch (e) {
    return getDB().ebooks.find(e => e.id === id) || null;
  }
}

export async function getVideoById(id: string) {
  try {
    const uuidId = toUUID(id);
    const { data, error } = await supabaseServer
      .from('videos')
      .select('id,title,youtube_url,category_id,product_id,created_at')
      .eq('id', uuidId)
      .maybeSingle();
    
    if (error || !data) {
      return getDB().videos.find(v => v.id === id) || null;
    }
    return {
      id: toShortId(data.id),
      title: data.title,
      youtube_url: data.youtube_url,
      category_id: toShortId(data.category_id),
      parent_product_id: toShortId(data.product_id),
      created_at: data.created_at
    };
  } catch (e) {
    return getDB().videos.find(v => v.id === id) || null;
  }
}

export async function getUnifiedFeed() {
  const [categories, products, ebooks, videos, webinars] = await Promise.all([
    getCategories(),
    getProducts(),
    getEbooks(),
    getVideos(),
    getWebinars()
  ]);

  const ebooksFeed = ebooks.map(eb => ({
    id: eb.id,
    title: eb.title,
    type: 'ebook' as const,
    categoryId: eb.category_id,
    productId: eb.parent_product_id,
    date: eb.created_at,
    url: `/ebooks/${eb.id}`,
    rawUrl: eb.pdf_url
  }));

  const videosFeed = videos.map(vi => ({
    id: vi.id,
    title: vi.title,
    type: 'video' as const,
    categoryId: vi.category_id,
    productId: vi.parent_product_id,
    date: vi.created_at,
    url: `/videos/${vi.id}`,
    rawUrl: vi.youtube_url
  }));

  const webinarsFeed = webinars.map(wb => ({
    id: wb.id,
    title: wb.title,
    type: 'webinar' as const,
    categoryId: '',
    productId: '',
    date: wb.schedule_date,
    url: wb.meeting_url,
    description: wb.description,
    isLive: wb.is_live
  }));

  const combined = [...ebooksFeed, ...videosFeed, ...webinarsFeed];
  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    feed: combined,
    categories,
    products
  };
}
