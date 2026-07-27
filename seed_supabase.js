const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://rjvqzguushsvmqebezjm.supabase.co';
const supabaseKey = 'sb_publishable_PSfffqa1xdeQBAc-1NQjaA_7Z4-nuzY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Deterministic UUID mapper to satisfy UUID type in PostgreSQL/Supabase
const uuidMap = {
  'cat-1': '11111111-1111-1111-1111-111111111111',
  'cat-2': '11111111-1111-1111-1111-111111111112',
  'cat-3': '11111111-1111-1111-1111-111111111113',
  'cat-4': '11111111-1111-1111-1111-111111111114',
  
  'prod-1': '22222222-2222-2222-2222-222222222221',
  'prod-2': '22222222-2222-2222-2222-222222222222',
  'prod-3': '22222222-2222-2222-2222-222222222223',
  'prod-4': '22222222-2222-2222-2222-222222222224',
  
  'ebk-1': '33333333-3333-3333-3333-333333333331',
  'ebk-2': '33333333-3333-3333-3333-333333333332',
  'ebk-3': '33333333-3333-3333-3333-333333333333',
  
  'vid-1': '44444444-4444-4444-4444-444444444441',
  'vid-2': '44444444-4444-4444-4444-444444444442',
  'vid-3': '44444444-4444-4444-4444-444444444443',
  
  'web-1': '55555555-5555-5555-5555-555555555551',
  'web-2': '55555555-5555-5555-5555-555555555552',
};

function toUUID(oldId) {
  if (!oldId) return null;
  if (uuidMap[oldId]) return uuidMap[oldId];
  // If already a valid UUID, return it
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(oldId)) {
    return oldId;
  }
  // Otherwise generate a pseudo-random but valid UUID shape
  return 'abcdefab-abcd-abcd-abcd-abcdefabcdef';
}

async function seed() {
  console.log("Loading db-store.json...");
  const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/lib/db-store.json'), 'utf8'));

  // 1. Seed categories
  console.log("Seeding categories...");
  const categoriesToInsert = dbData.categories.map(c => ({
    id: toUUID(c.id),
    name: c.name,
    slug: c.slug
  }));
  for (const item of categoriesToInsert) {
    const { error } = await supabase.from('categories').upsert(item);
    if (error) console.error("Category insert failed:", error.message, item);
  }
  console.log("Categories seeded.");

  // 2. Seed products
  console.log("Seeding products...");
  const productsToInsert = dbData.products.map(p => ({
    id: toUUID(p.id),
    name: p.name,
    external_url: p.external_purchase_url, // Maps external_purchase_url -> external_url
    image_url: p.image_url,
    category_id: toUUID(p.category_id)
  }));
  for (const item of productsToInsert) {
    const { error } = await supabase.from('products').upsert(item);
    if (error) console.error("Product insert failed:", error.message, item);
  }
  console.log("Products seeded.");

  // 3. Seed ebooks
  console.log("Seeding ebooks...");
  const ebooksToInsert = dbData.ebooks.map(e => ({
    id: toUUID(e.id),
    title: e.title,
    pdf_url: e.pdf_url,
    category_id: toUUID(e.category_id),
    product_id: toUUID(e.parent_product_id), // Maps parent_product_id -> product_id
    created_at: e.created_at
  }));
  for (const item of ebooksToInsert) {
    const { error } = await supabase.from('ebooks').upsert(item);
    if (error) console.error("Ebook insert failed:", error.message, item);
  }
  console.log("Ebooks seeded.");

  // 4. Seed videos
  console.log("Seeding videos...");
  const videosToInsert = dbData.videos.map(v => ({
    id: toUUID(v.id),
    title: v.title,
    youtube_url: v.youtube_url,
    category_id: toUUID(v.category_id),
    product_id: toUUID(v.parent_product_id), // Maps parent_product_id -> product_id
    created_at: v.created_at
  }));
  for (const item of videosToInsert) {
    const { error } = await supabase.from('videos').upsert(item);
    if (error) console.error("Video insert failed:", error.message, item);
  }
  console.log("Videos seeded.");

  // 5. Seed webinars
  console.log("Seeding webinars...");
  const webinarsToInsert = dbData.webinars.map(w => ({
    id: toUUID(w.id),
    title: w.title,
    description: w.description,
    meeting_url: w.meeting_url,
    schedule_date: w.schedule_date,
    is_live: w.is_live
    // Note: category_id and product_id omitted as they don't exist in the webinars schema on Supabase
  }));
  for (const item of webinarsToInsert) {
    const { error } = await supabase.from('webinars').upsert(item);
    if (error) console.error("Webinar insert failed:", error.message, item);
  }
  console.log("Webinars seeded.");
}

seed().catch(err => {
  console.error("Seeding crashed:", err);
});
