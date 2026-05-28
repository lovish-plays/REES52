'use server';

import { getDB, saveDB, generateUUID, Category, Product, Ebook, Video, Webinar } from '@/lib/db';
import { getCurrentUser } from './auth';
import { createClient } from '@/lib/supabaseServer';

// Middleware-like check to ensure user is admin
async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') {
    throw new Error('Unauthorized. Admin privilege required.');
  }
}

// ---------------- CATEGORY CRUD ----------------

export async function addCategory(name: string, slug: string) {
  await checkAdmin();
  if (!name || !slug) return { error: 'Missing required fields' };

  const db = getDB();
  const slugExists = db.categories.some(c => c.slug === slug.toLowerCase());
  if (slugExists) return { error: 'Category slug already exists' };

  const newCat: Category = {
    id: generateUUID(),
    name,
    slug: slug.toLowerCase().replace(/\s+/g, '-')
  };

  // 1. Save to local JSON store
  db.categories.push(newCat);
  saveDB(db);

  // 2. Save to Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('categories').insert({
      id: newCat.id,
      name: newCat.name,
      slug: newCat.slug
    });
    if (error) {
      console.error("Supabase category insert failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase category insert exception:", err);
  }

  return { success: true, category: newCat };
}

export async function deleteCategory(id: string) {
  await checkAdmin();
  const db = getDB();
  
  // 1. Save to local JSON store
  db.categories = db.categories.filter(c => c.id !== id);
  saveDB(db);

  // 2. Delete from Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('categories').delete().eq('id', id);
    if (error) {
      console.error("Supabase category delete failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase category delete exception:", err);
  }

  return { success: true };
}

// ---------------- PRODUCT CRUD ----------------

export async function addProduct(formData: { name: string; external_purchase_url: string; image_url: string; category_id: string }) {
  await checkAdmin();
  const { name, external_purchase_url, image_url, category_id } = formData;
  if (!name || !external_purchase_url || !image_url || !category_id) {
    return { error: 'Missing required fields' };
  }

  const db = getDB();
  const newProd: Product = {
    id: generateUUID(),
    name,
    external_purchase_url,
    image_url,
    category_id
  };

  // 1. Save to local JSON store
  db.products.push(newProd);
  saveDB(db);

  // 2. Save to Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('products').insert({
      id: newProd.id,
      name: newProd.name,
      external_url: newProd.external_purchase_url, // Maps external_purchase_url -> external_url
      image_url: newProd.image_url,
      category_id: newProd.category_id
    });
    if (error) {
      console.error("Supabase product insert failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase product insert exception:", err);
  }

  return { success: true, product: newProd };
}

export async function deleteProduct(id: string) {
  await checkAdmin();
  const db = getDB();
  
  // 1. Save to local JSON store
  db.products = db.products.filter(p => p.id !== id);
  saveDB(db);

  // 2. Delete from Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('products').delete().eq('id', id);
    if (error) {
      console.error("Supabase product delete failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase product delete exception:", err);
  }

  return { success: true };
}

// ---------------- EBOOK CRUD ----------------

export async function addEbook(formData: { title: string; pdf_url: string; category_id: string; parent_product_id: string }) {
  await checkAdmin();
  const { title, pdf_url, category_id, parent_product_id } = formData;
  if (!title || !pdf_url || !category_id || !parent_product_id) {
    return { error: 'Missing required fields' };
  }

  const db = getDB();
  const newEbook: Ebook = {
    id: generateUUID(),
    title,
    pdf_url,
    category_id,
    parent_product_id,
    created_at: new Date().toISOString()
  };

  // 1. Save to local JSON store
  db.ebooks.push(newEbook);
  saveDB(db);

  // 2. Save to Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('ebooks').insert({
      id: newEbook.id,
      title: newEbook.title,
      pdf_url: newEbook.pdf_url,
      category_id: newEbook.category_id,
      product_id: newEbook.parent_product_id, // Maps parent_product_id -> product_id
      created_at: newEbook.created_at
    });
    if (error) {
      console.error("Supabase ebook insert failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase ebook insert exception:", err);
  }

  return { success: true, ebook: newEbook };
}

export async function deleteEbook(id: string) {
  await checkAdmin();
  const db = getDB();
  
  // 1. Save to local JSON store
  db.ebooks = db.ebooks.filter(e => e.id !== id);
  saveDB(db);

  // 2. Delete from Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('ebooks').delete().eq('id', id);
    if (error) {
      console.error("Supabase ebook delete failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase ebook delete exception:", err);
  }

  return { success: true };
}

// ---------------- VIDEO CRUD ----------------

export async function addVideo(formData: { title: string; youtube_url: string; category_id: string; parent_product_id: string }) {
  await checkAdmin();
  const { title, youtube_url, category_id, parent_product_id } = formData;
  if (!title || !youtube_url || !category_id || !parent_product_id) {
    return { error: 'Missing required fields' };
  }

  const db = getDB();
  const newVideo: Video = {
    id: generateUUID(),
    title,
    youtube_url,
    category_id,
    parent_product_id,
    created_at: new Date().toISOString()
  };

  // 1. Save to local JSON store
  db.videos.push(newVideo);
  saveDB(db);

  // 2. Save to Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('videos').insert({
      id: newVideo.id,
      title: newVideo.title,
      youtube_url: newVideo.youtube_url,
      category_id: newVideo.category_id,
      product_id: newVideo.parent_product_id, // Maps parent_product_id -> product_id
      created_at: newVideo.created_at
    });
    if (error) {
      console.error("Supabase video insert failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase video insert exception:", err);
  }

  return { success: true, video: newVideo };
}

export async function deleteVideo(id: string) {
  await checkAdmin();
  const db = getDB();
  
  // 1. Save to local JSON store
  db.videos = db.videos.filter(v => v.id !== id);
  saveDB(db);

  // 2. Delete from Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('videos').delete().eq('id', id);
    if (error) {
      console.error("Supabase video delete failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase video delete exception:", err);
  }

  return { success: true };
}

// ---------------- WEBINAR CRUD ----------------

export async function addWebinar(formData: { title: string; description: string; meeting_url: string; schedule_date: string; is_live: boolean }) {
  await checkAdmin();
  const { title, description, meeting_url, schedule_date, is_live } = formData;
  if (!title || !description || !meeting_url || !schedule_date) {
    return { error: 'Missing required fields' };
  }

  const db = getDB();
  const newWebinar: Webinar = {
    id: generateUUID(),
    title,
    description,
    meeting_url,
    schedule_date: new Date(schedule_date).toISOString(),
    is_live
  };

  // 1. Save to local JSON store
  db.webinars.push(newWebinar);
  saveDB(db);

  // 2. Save to Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('webinars').insert({
      id: newWebinar.id,
      title: newWebinar.title,
      description: newWebinar.description,
      meeting_url: newWebinar.meeting_url,
      schedule_date: newWebinar.schedule_date,
      is_live: newWebinar.is_live
    });
    if (error) {
      console.error("Supabase webinar insert failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase webinar insert exception:", err);
  }

  return { success: true, webinar: newWebinar };
}

export async function deleteWebinar(id: string) {
  await checkAdmin();
  const db = getDB();
  
  // 1. Save to local JSON store
  db.webinars = db.webinars.filter(w => w.id !== id);
  saveDB(db);

  // 2. Delete from Supabase (best-effort)
  try {
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('webinars').delete().eq('id', id);
    if (error) {
      console.error("Supabase webinar delete failed:", error.message);
    }
  } catch (err) {
    console.error("Supabase webinar delete exception:", err);
  }

  return { success: true };
}
