import { MetadataRoute } from 'next';
import { supabasePublic } from '@/lib/supabasePublic';
import { fromUUID } from '@/lib/uuidHelper';
import { getCourses, getEbooks, getProjects } from '@/lib/lms/data';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/courses",
    "/projects",
    "/quizzes",
    "/ebooks",
  ];
  
  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const [courses, projects, ebooks, { data: videosData }] = await Promise.all([
      getCourses(),
      getProjects(),
      getEbooks(),
      supabasePublic.from('videos').select('id, created_at'),
    ]);

    courses.forEach((course) => {
      sitemapEntries.push({
        url: absoluteUrl(`/courses/${course.slug}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });

    projects.forEach((project) => {
      sitemapEntries.push({
        url: absoluteUrl(`/projects/${project.slug}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    });

    ebooks.forEach((ebook) => {
      if (!ebook.id) return;
      const readableId = fromUUID(ebook.id);
      sitemapEntries.push({
        url: absoluteUrl(`/ebooks/${readableId}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    });

    if (videosData) {
      videosData.forEach((v) => {
        const readableId = fromUUID(v.id);
        sitemapEntries.push({
          url: absoluteUrl(`/videos/${readableId}`),
          lastModified: v.created_at ? new Date(v.created_at) : now,
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
