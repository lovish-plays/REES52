import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjvqzguushsvmqebezjm.supabase.co';
const supabaseKey = 'sb_publishable_PSfffqa1xdeQBAc-1NQjaA_7Z4-nuzY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testProducts() {
  console.log("Testing products with external_url...");
  const { data: d1, error: e1 } = await supabase.from('products').select('id, name, external_url, image_url, category_id').limit(1);
  if (e1) {
    console.error("products external_url failed:", e1.message);
  } else {
    console.log("products external_url succeeded!");
  }

  console.log("Testing products with external_purchase_url...");
  const { data: d2, error: e2 } = await supabase.from('products').select('id, name, external_purchase_url, image_url, category_id').limit(1);
  if (e2) {
    console.error("products external_purchase_url failed:", e2.message);
  } else {
    console.log("products external_purchase_url succeeded!");
  }
}

async function testEbooks() {
  console.log("Testing ebooks with product_id...");
  const { data: d1, error: e1 } = await supabase.from('ebooks').select('id, title, pdf_url, category_id, product_id').limit(1);
  if (e1) {
    console.error("ebooks product_id failed:", e1.message);
  } else {
    console.log("ebooks product_id succeeded!");
  }

  console.log("Testing ebooks with parent_product_id...");
  const { data: d2, error: e2 } = await supabase.from('ebooks').select('id, title, pdf_url, category_id, parent_product_id').limit(1);
  if (e2) {
    console.error("ebooks parent_product_id failed:", e2.message);
  } else {
    console.log("ebooks parent_product_id succeeded!");
  }
}

async function testVideos() {
  console.log("Testing videos with product_id...");
  const { data: d1, error: e1 } = await supabase.from('videos').select('id, title, youtube_url, category_id, product_id').limit(1);
  if (e1) {
    console.error("videos product_id failed:", e1.message);
  } else {
    console.log("videos product_id succeeded!");
  }

  console.log("Testing videos with parent_product_id...");
  const { data: d2, error: e2 } = await supabase.from('videos').select('id, title, youtube_url, category_id, parent_product_id').limit(1);
  if (e2) {
    console.error("videos parent_product_id failed:", e2.message);
  } else {
    console.log("videos parent_product_id succeeded!");
  }
}

async function testWebinars() {
  console.log("Testing webinars with all columns...");
  const { data, error } = await supabase.from('webinars').select('id, title, description, meeting_url, category_id, parent_product_id, schedule_date, is_live, created_at').limit(1);
  if (error) {
    console.error("webinars with all columns failed:", error.message);
  } else {
    console.log("webinars with all columns succeeded!");
  }

  console.log("Testing webinars with only basic columns...");
  const { data: d2, error: e2 } = await supabase.from('webinars').select('id, title, description, meeting_url, schedule_date, is_live').limit(1);
  if (e2) {
    console.error("webinars with basic columns failed:", e2.message);
  } else {
    console.log("webinars with basic columns succeeded!");
  }
}

async function inspect() {
  await testProducts();
  await testEbooks();
  await testVideos();
  await testWebinars();
}

inspect();


