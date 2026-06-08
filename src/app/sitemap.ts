import { MetadataRoute } from 'next';
import { supabasePublic } from '@/lib/supabasePublic';
import { fromUUID } from '@/lib/uuidHelper';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rees52.tech";
  
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/login",
  ];
  
  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const [{ data: videosData }, { data: ebooksData }] = await Promise.all([
      supabasePublic.from('videos').select('id, created_at'),
      supabasePublic.from('ebooks').select('id, created_at')
    ]);

    if (videosData) {
      videosData.forEach((v) => {
        const readableId = fromUUID(v.id);
        sitemapEntries.push({
          url: `${baseUrl}/videos/${readableId}`,
          lastModified: v.created_at ? new Date(v.created_at).toISOString() : new Date().toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      });
    }

    if (ebooksData) {
      ebooksData.forEach((e) => {
        const readableId = fromUUID(e.id);
        sitemapEntries.push({
          url: `${baseUrl}/ebooks/${readableId}`,
          lastModified: e.created_at ? new Date(e.created_at).toISOString() : new Date().toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      });
    }
  } catch (err) {
    console.error("Failed to generate dynamic sitemap entries:", err);
  }

  return sitemapEntries;
}
