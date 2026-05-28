'use server';

import { getCurrentUser } from './auth';
import { createClient } from '@/lib/supabaseServer';
import { randomUUID } from 'crypto';

// Run auth check and DB client creation in parallel
async function getAdminClient() {
  const [user, supabase] = await Promise.all([
    getCurrentUser(),
    createClient(),
  ]);
  if (!user || user.role !== 'Admin') {
    throw new Error('Unauthorized. Admin privilege required.');
  }
  return supabase;
}

// ---------------- CATEGORY CRUD ----------------

export async function addCategory(name: string, slug: string) {
  if (!name || !slug) return { error: 'Missing required fields' };
  try {
    const supabase = await getAdminClient();
    const newId = randomUUID();
    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from('categories')
      .insert({ id: newId, name, slug: cleanSlug })
      .select('id,name,slug')
      .single();

    if (error) return { error: error.message };
    return { success: true, category: data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await getAdminClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ---------------- PRODUCT CRUD ----------------

export async function addProduct(formData: {
  name: string;
  external_purchase_url: string;
  image_url?: string;
  category_id: string;
}) {
  const { name, external_purchase_url, image_url = '', category_id } = formData;
  if (!name || !external_purchase_url || !category_id)
    return { error: 'Missing required fields' };
  try {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from('products')
      .insert({
        id: randomUUID(),
        name,
        external_url: external_purchase_url,
        image_url,
        category_id,
      })
      .select('id,name,external_url,image_url,category_id')
      .single();

    if (error) return { error: error.message };
    return {
      success: true,
      product: {
        id: data.id,
        name: data.name,
        external_purchase_url: data.external_url,
        image_url: data.image_url,
        category_id: data.category_id,
      },
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await getAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ---------------- EBOOK CRUD ----------------

export async function addEbook(formData: {
  title: string;
  pdf_url: string;
  category_id: string;
  parent_product_id: string;
}) {
  const { title, pdf_url, category_id, parent_product_id } = formData;
  if (!title || !pdf_url || !category_id || !parent_product_id)
    return { error: 'Missing required fields' };
  try {
    const supabase = await getAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('ebooks')
      .insert({
        id: randomUUID(),
        title,
        pdf_url,
        category_id,
        product_id: parent_product_id,
        created_at: now,
      })
      .select('id,title,pdf_url,category_id,product_id,created_at')
      .single();

    if (error) return { error: error.message };
    return {
      success: true,
      ebook: {
        id: data.id,
        title: data.title,
        pdf_url: data.pdf_url,
        category_id: data.category_id,
        parent_product_id: data.product_id,
        created_at: data.created_at,
      },
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteEbook(id: string) {
  try {
    const supabase = await getAdminClient();
    const { error } = await supabase.from('ebooks').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ---------------- VIDEO CRUD ----------------

export async function addVideo(formData: {
  title: string;
  youtube_url: string;
  category_id: string;
  parent_product_id: string;
}) {
  const { title, youtube_url, category_id, parent_product_id } = formData;
  if (!title || !youtube_url || !category_id || !parent_product_id)
    return { error: 'Missing required fields' };
  try {
    const supabase = await getAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('videos')
      .insert({
        id: randomUUID(),
        title,
        youtube_url,
        category_id,
        product_id: parent_product_id,
        created_at: now,
      })
      .select('id,title,youtube_url,category_id,product_id,created_at')
      .single();

    if (error) return { error: error.message };
    return {
      success: true,
      video: {
        id: data.id,
        title: data.title,
        youtube_url: data.youtube_url,
        category_id: data.category_id,
        parent_product_id: data.product_id,
        created_at: data.created_at,
      },
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteVideo(id: string) {
  try {
    const supabase = await getAdminClient();
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ---------------- WEBINAR CRUD ----------------

export async function addWebinar(formData: {
  title: string;
  description: string;
  meeting_url: string;
  schedule_date: string;
  is_live: boolean;
}) {
  const { title, description, meeting_url, schedule_date, is_live } = formData;
  if (!title || !description || !meeting_url || !schedule_date)
    return { error: 'Missing required fields' };
  try {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from('webinars')
      .insert({
        id: randomUUID(),
        title,
        description,
        meeting_url,
        schedule_date: new Date(schedule_date).toISOString(),
        is_live,
      })
      .select('id,title,description,meeting_url,schedule_date,is_live')
      .single();

    if (error) return { error: error.message };
    return { success: true, webinar: data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteWebinar(id: string) {
  try {
    const supabase = await getAdminClient();
    const { error } = await supabase.from('webinars').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
